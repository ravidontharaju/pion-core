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
if(!dojo._hasResource["dojo.date"]){
dojo._hasResource["dojo.date"]=true;
dojo.provide("dojo.date");
dojo.date.getDaysInMonth=function(_705){
var _706=_705.getMonth();
var days=[31,28,31,30,31,30,31,31,30,31,30,31];
if(_706==1&&dojo.date.isLeapYear(_705)){
return 29;
}
return days[_706];
};
dojo.date.isLeapYear=function(_708){
var year=_708.getFullYear();
return !(year%400)||(!(year%4)&&!!(year%100));
};
dojo.date.getTimezoneName=function(_70a){
var str=_70a.toString();
var tz="";
var _70d;
var pos=str.indexOf("(");
if(pos>-1){
tz=str.substring(++pos,str.indexOf(")"));
}else{
var pat=/([A-Z\/]+) \d{4}$/;
if((_70d=str.match(pat))){
tz=_70d[1];
}else{
str=_70a.toLocaleString();
pat=/ ([A-Z\/]+)$/;
if((_70d=str.match(pat))){
tz=_70d[1];
}
}
}
return (tz=="AM"||tz=="PM")?"":tz;
};
dojo.date.compare=function(_710,_711,_712){
_710=new Date(Number(_710));
_711=new Date(Number(_711||new Date()));
if(_712!=="undefined"){
if(_712=="date"){
_710.setHours(0,0,0,0);
_711.setHours(0,0,0,0);
}else{
if(_712=="time"){
_710.setFullYear(0,0,0);
_711.setFullYear(0,0,0);
}
}
}
if(_710>_711){
return 1;
}
if(_710<_711){
return -1;
}
return 0;
};
dojo.date.add=function(date,_714,_715){
var sum=new Date(Number(date));
var _717=false;
var _718="Date";
switch(_714){
case "day":
break;
case "weekday":
var days,_71a;
var mod=_715%5;
if(!mod){
days=(_715>0)?5:-5;
_71a=(_715>0)?((_715-5)/5):((_715+5)/5);
}else{
days=mod;
_71a=parseInt(_715/5);
}
var strt=date.getDay();
var adj=0;
if(strt==6&&_715>0){
adj=1;
}else{
if(strt==0&&_715<0){
adj=-1;
}
}
var trgt=strt+days;
if(trgt==0||trgt==6){
adj=(_715>0)?2:-2;
}
_715=(7*_71a)+days+adj;
break;
case "year":
_718="FullYear";
_717=true;
break;
case "week":
_715*=7;
break;
case "quarter":
_715*=3;
case "month":
_717=true;
_718="Month";
break;
case "hour":
case "minute":
case "second":
case "millisecond":
_718="UTC"+_714.charAt(0).toUpperCase()+_714.substring(1)+"s";
}
if(_718){
sum["set"+_718](sum["get"+_718]()+_715);
}
if(_717&&(sum.getDate()<date.getDate())){
sum.setDate(0);
}
return sum;
};
dojo.date.difference=function(_71f,_720,_721){
_720=_720||new Date();
_721=_721||"day";
var _722=_720.getFullYear()-_71f.getFullYear();
var _723=1;
switch(_721){
case "quarter":
var m1=_71f.getMonth();
var m2=_720.getMonth();
var q1=Math.floor(m1/3)+1;
var q2=Math.floor(m2/3)+1;
q2+=(_722*4);
_723=q2-q1;
break;
case "weekday":
var days=Math.round(dojo.date.difference(_71f,_720,"day"));
var _729=parseInt(dojo.date.difference(_71f,_720,"week"));
var mod=days%7;
if(mod==0){
days=_729*5;
}else{
var adj=0;
var aDay=_71f.getDay();
var bDay=_720.getDay();
_729=parseInt(days/7);
mod=days%7;
var _72e=new Date(_71f);
_72e.setDate(_72e.getDate()+(_729*7));
var _72f=_72e.getDay();
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
case (_72f+mod)>5:
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
case (_72f+mod)<0:
adj=2;
}
}
}
days+=adj;
days-=(_729*2);
}
_723=days;
break;
case "year":
_723=_722;
break;
case "month":
_723=(_720.getMonth()-_71f.getMonth())+(_722*12);
break;
case "week":
_723=parseInt(dojo.date.difference(_71f,_720,"day")/7);
break;
case "day":
_723/=24;
case "hour":
_723/=60;
case "minute":
_723/=60;
case "second":
_723/=1000;
case "millisecond":
_723*=_720.getTime()-_71f.getTime();
}
return Math.round(_723);
};
}
if(!dojo._hasResource["dojo.cldr.supplemental"]){
dojo._hasResource["dojo.cldr.supplemental"]=true;
dojo.provide("dojo.cldr.supplemental");
dojo.cldr.supplemental.getFirstDayOfWeek=function(_730){
var _731={mv:5,ae:6,af:6,bh:6,dj:6,dz:6,eg:6,er:6,et:6,iq:6,ir:6,jo:6,ke:6,kw:6,lb:6,ly:6,ma:6,om:6,qa:6,sa:6,sd:6,so:6,tn:6,ye:6,as:0,au:0,az:0,bw:0,ca:0,cn:0,fo:0,ge:0,gl:0,gu:0,hk:0,ie:0,il:0,is:0,jm:0,jp:0,kg:0,kr:0,la:0,mh:0,mo:0,mp:0,mt:0,nz:0,ph:0,pk:0,sg:0,th:0,tt:0,tw:0,um:0,us:0,uz:0,vi:0,za:0,zw:0,et:0,mw:0,ng:0,tj:0,sy:4};
var _732=dojo.cldr.supplemental._region(_730);
var dow=_731[_732];
return (dow===undefined)?1:dow;
};
dojo.cldr.supplemental._region=function(_734){
_734=dojo.i18n.normalizeLocale(_734);
var tags=_734.split("-");
var _736=tags[1];
if(!_736){
_736={de:"de",en:"us",es:"es",fi:"fi",fr:"fr",he:"il",hu:"hu",it:"it",ja:"jp",ko:"kr",nl:"nl",pt:"br",sv:"se",zh:"cn"}[tags[0]];
}else{
if(_736.length==4){
_736=tags[2];
}
}
return _736;
};
dojo.cldr.supplemental.getWeekend=function(_737){
var _738={eg:5,il:5,sy:5,"in":0,ae:4,bh:4,dz:4,iq:4,jo:4,kw:4,lb:4,ly:4,ma:4,om:4,qa:4,sa:4,sd:4,tn:4,ye:4};
var _739={ae:5,bh:5,dz:5,iq:5,jo:5,kw:5,lb:5,ly:5,ma:5,om:5,qa:5,sa:5,sd:5,tn:5,ye:5,af:5,ir:5,eg:6,il:6,sy:6};
var _73a=dojo.cldr.supplemental._region(_737);
var _73b=_738[_73a];
var end=_739[_73a];
if(_73b===undefined){
_73b=6;
}
if(end===undefined){
end=0;
}
return {start:_73b,end:end};
};
}
if(!dojo._hasResource["dojo.date.locale"]){
dojo._hasResource["dojo.date.locale"]=true;
dojo.provide("dojo.date.locale");
(function(){
function _73d(_73e,_73f,_740,_741){
return _741.replace(/([a-z])\1*/ig,function(_742){
var s,pad;
var c=_742.charAt(0);
var l=_742.length;
var _747=["abbr","wide","narrow"];
switch(c){
case "G":
s=_73f[(l<4)?"eraAbbr":"eraNames"][_73e.getFullYear()<0?0:1];
break;
case "y":
s=_73e.getFullYear();
switch(l){
case 1:
break;
case 2:
if(!_740){
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
s=Math.ceil((_73e.getMonth()+1)/3);
pad=true;
break;
case "M":
var m=_73e.getMonth();
if(l<3){
s=m+1;
pad=true;
}else{
var _749=["months","format",_747[l-3]].join("-");
s=_73f[_749][m];
}
break;
case "w":
var _74a=0;
s=dojo.date.locale._getWeekOfYear(_73e,_74a);
pad=true;
break;
case "d":
s=_73e.getDate();
pad=true;
break;
case "D":
s=dojo.date.locale._getDayOfYear(_73e);
pad=true;
break;
case "E":
var d=_73e.getDay();
if(l<3){
s=d+1;
pad=true;
}else{
var _74c=["days","format",_747[l-3]].join("-");
s=_73f[_74c][d];
}
break;
case "a":
var _74d=(_73e.getHours()<12)?"am":"pm";
s=_73f[_74d];
break;
case "h":
case "H":
case "K":
case "k":
var h=_73e.getHours();
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
s=_73e.getMinutes();
pad=true;
break;
case "s":
s=_73e.getSeconds();
pad=true;
break;
case "S":
s=Math.round(_73e.getMilliseconds()*Math.pow(10,l-3));
pad=true;
break;
case "v":
case "z":
s=dojo.date.getTimezoneName(_73e);
if(s){
break;
}
l=4;
case "Z":
var _74f=_73e.getTimezoneOffset();
var tz=[(_74f<=0?"+":"-"),dojo.string.pad(Math.floor(Math.abs(_74f)/60),2),dojo.string.pad(Math.abs(_74f)%60,2)];
if(l==4){
tz.splice(0,0,"GMT");
tz.splice(3,0,":");
}
s=tz.join("");
break;
default:
throw new Error("dojo.date.locale.format: invalid pattern char: "+_741);
}
if(pad){
s=dojo.string.pad(s,l);
}
return s;
});
};
dojo.date.locale.format=function(_751,_752){
_752=_752||{};
var _753=dojo.i18n.normalizeLocale(_752.locale);
var _754=_752.formatLength||"short";
var _755=dojo.date.locale._getGregorianBundle(_753);
var str=[];
var _757=dojo.hitch(this,_73d,_751,_755,_752.fullYear);
if(_752.selector=="year"){
var year=_751.getFullYear();
if(_753.match(/^zh|^ja/)){
year+="年";
}
return year;
}
if(_752.selector!="time"){
var _759=_752.datePattern||_755["dateFormat-"+_754];
if(_759){
str.push(_75a(_759,_757));
}
}
if(_752.selector!="date"){
var _75b=_752.timePattern||_755["timeFormat-"+_754];
if(_75b){
str.push(_75a(_75b,_757));
}
}
var _75c=str.join(" ");
return _75c;
};
dojo.date.locale.regexp=function(_75d){
return dojo.date.locale._parseInfo(_75d).regexp;
};
dojo.date.locale._parseInfo=function(_75e){
_75e=_75e||{};
var _75f=dojo.i18n.normalizeLocale(_75e.locale);
var _760=dojo.date.locale._getGregorianBundle(_75f);
var _761=_75e.formatLength||"short";
var _762=_75e.datePattern||_760["dateFormat-"+_761];
var _763=_75e.timePattern||_760["timeFormat-"+_761];
var _764;
if(_75e.selector=="date"){
_764=_762;
}else{
if(_75e.selector=="time"){
_764=_763;
}else{
_764=_762+" "+_763;
}
}
var _765=[];
var re=_75a(_764,dojo.hitch(this,_767,_765,_760,_75e));
return {regexp:re,tokens:_765,bundle:_760};
};
dojo.date.locale.parse=function(_768,_769){
var info=dojo.date.locale._parseInfo(_769);
var _76b=info.tokens,_76c=info.bundle;
var re=new RegExp("^"+info.regexp+"$",info.strict?"":"i");
var _76e=re.exec(_768);
if(!_76e){
return null;
}
var _76f=["abbr","wide","narrow"];
var _770=[1970,0,1,0,0,0,0];
var amPm="";
var _772=dojo.every(_76e,function(v,i){
if(!i){
return true;
}
var _775=_76b[i-1];
var l=_775.length;
switch(_775.charAt(0)){
case "y":
if(l!=2&&_769.strict){
_770[0]=v;
}else{
if(v<100){
v=Number(v);
var year=""+new Date().getFullYear();
var _778=year.substring(0,2)*100;
var _779=Math.min(Number(year.substring(2,4))+20,99);
var num=(v<_779)?_778+v:_778-100+v;
_770[0]=num;
}else{
if(_769.strict){
return false;
}
_770[0]=v;
}
}
break;
case "M":
if(l>2){
var _77b=_76c["months-format-"+_76f[l-3]].concat();
if(!_769.strict){
v=v.replace(".","").toLowerCase();
_77b=dojo.map(_77b,function(s){
return s.replace(".","").toLowerCase();
});
}
v=dojo.indexOf(_77b,v);
if(v==-1){
return false;
}
}else{
v--;
}
_770[1]=v;
break;
case "E":
case "e":
var days=_76c["days-format-"+_76f[l-3]].concat();
if(!_769.strict){
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
_770[1]=0;
case "d":
_770[2]=v;
break;
case "a":
var am=_769.am||_76c.am;
var pm=_769.pm||_76c.pm;
if(!_769.strict){
var _781=/\./g;
v=v.replace(_781,"").toLowerCase();
am=am.replace(_781,"").toLowerCase();
pm=pm.replace(_781,"").toLowerCase();
}
if(_769.strict&&v!=am&&v!=pm){
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
_770[3]=v;
break;
case "m":
_770[4]=v;
break;
case "s":
_770[5]=v;
break;
case "S":
_770[6]=v;
}
return true;
});
var _782=+_770[3];
if(amPm==="p"&&_782<12){
_770[3]=_782+12;
}else{
if(amPm==="a"&&_782==12){
_770[3]=0;
}
}
var _783=new Date(_770[0],_770[1],_770[2],_770[3],_770[4],_770[5],_770[6]);
if(_769.strict){
_783.setFullYear(_770[0]);
}
var _784=_76b.join(""),_785=_784.indexOf("d")!=-1,_786=_784.indexOf("M")!=-1;
if(!_772||(_786&&_783.getMonth()>_770[1])||(_785&&_783.getDate()>_770[2])){
return null;
}
if((_786&&_783.getMonth()<_770[1])||(_785&&_783.getDate()<_770[2])){
_783=dojo.date.add(_783,"hour",1);
}
return _783;
};
function _75a(_787,_788,_789,_78a){
var _78b=function(x){
return x;
};
_788=_788||_78b;
_789=_789||_78b;
_78a=_78a||_78b;
var _78d=_787.match(/(''|[^'])+/g);
var _78e=_787.charAt(0)=="'";
dojo.forEach(_78d,function(_78f,i){
if(!_78f){
_78d[i]="";
}else{
_78d[i]=(_78e?_789:_788)(_78f);
_78e=!_78e;
}
});
return _78a(_78d.join(""));
};
function _767(_791,_792,_793,_794){
_794=dojo.regexp.escapeString(_794);
if(!_793.strict){
_794=_794.replace(" a"," ?a");
}
return _794.replace(/([a-z])\1*/ig,function(_795){
var s;
var c=_795.charAt(0);
var l=_795.length;
var p2="",p3="";
if(_793.strict){
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
var am=_793.am||_792.am||"AM";
var pm=_793.pm||_792.pm||"PM";
if(_793.strict){
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
if(_791){
_791.push(_795);
}
return "("+s+")";
}).replace(/[\xa0 ]/g,"[\\s\\xa0]");
};
})();
(function(){
var _79d=[];
dojo.date.locale.addCustomFormats=function(_79e,_79f){
_79d.push({pkg:_79e,name:_79f});
};
dojo.date.locale._getGregorianBundle=function(_7a0){
var _7a1={};
dojo.forEach(_79d,function(desc){
var _7a3=dojo.i18n.getLocalization(desc.pkg,desc.name,_7a0);
_7a1=dojo.mixin(_7a1,_7a3);
},this);
return _7a1;
};
})();
dojo.date.locale.addCustomFormats("dojo.cldr","gregorian");
dojo.date.locale.getNames=function(item,type,_7a6,_7a7){
var _7a8;
var _7a9=dojo.date.locale._getGregorianBundle(_7a7);
var _7aa=[item,_7a6,type];
if(_7a6=="standAlone"){
var key=_7aa.join("-");
_7a8=_7a9[key];
if(_7a8[0]==1){
_7a8=undefined;
}
}
_7aa[1]="format";
return (_7a8||_7a9[_7aa.join("-")]).concat();
};
dojo.date.locale.isWeekend=function(_7ac,_7ad){
var _7ae=dojo.cldr.supplemental.getWeekend(_7ad);
var day=(_7ac||new Date()).getDay();
if(_7ae.end<_7ae.start){
_7ae.end+=7;
if(day<_7ae.start){
day+=7;
}
}
return day>=_7ae.start&&day<=_7ae.end;
};
dojo.date.locale._getDayOfYear=function(_7b0){
return dojo.date.difference(new Date(_7b0.getFullYear(),0,1,_7b0.getHours()),_7b0)+1;
};
dojo.date.locale._getWeekOfYear=function(_7b1,_7b2){
if(arguments.length==1){
_7b2=0;
}
var _7b3=new Date(_7b1.getFullYear(),0,1).getDay();
var adj=(_7b3-_7b2+7)%7;
var week=Math.floor((dojo.date.locale._getDayOfYear(_7b1)+adj-1)/7);
if(_7b3==_7b2){
week++;
}
return week;
};
}
if(!dojo._hasResource["dijit._TimePicker"]){
dojo._hasResource["dijit._TimePicker"]=true;
dojo.provide("dijit._TimePicker");
dojo.declare("dijit._TimePicker",[dijit._Widget,dijit._Templated],{templateString:"<div id=\"widget_${id}\" class=\"dijitMenu ${baseClass}\"\r\n    ><div dojoAttachPoint=\"upArrow\" class=\"dijitButtonNode dijitUpArrowButton\" dojoAttachEvent=\"onmouseenter:_buttonMouse,onmouseleave:_buttonMouse\"\r\n\t\t><div class=\"dijitReset dijitInline dijitArrowButtonInner\" wairole=\"presentation\" role=\"presentation\">&nbsp;</div\r\n\t\t><div class=\"dijitArrowButtonChar\">&#9650;</div></div\r\n    ><div dojoAttachPoint=\"timeMenu,focusNode\" dojoAttachEvent=\"onclick:_onOptionSelected,onmouseover,onmouseout\"></div\r\n    ><div dojoAttachPoint=\"downArrow\" class=\"dijitButtonNode dijitDownArrowButton\" dojoAttachEvent=\"onmouseenter:_buttonMouse,onmouseleave:_buttonMouse\"\r\n\t\t><div class=\"dijitReset dijitInline dijitArrowButtonInner\" wairole=\"presentation\" role=\"presentation\">&nbsp;</div\r\n\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div></div\r\n></div>\r\n",baseClass:"dijitTimePicker",clickableIncrement:"T00:15:00",visibleIncrement:"T01:00:00",visibleRange:"T05:00:00",value:new Date(),_visibleIncrement:2,_clickableIncrement:1,_totalIncrements:10,constraints:{},serialize:dojo.date.stamp.toISOString,_filterString:"",setValue:function(_7b6){
dojo.deprecated("dijit._TimePicker:setValue() is deprecated.  Use attr('value') instead.","","2.0");
this.attr("value",_7b6);
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
},isDisabledDate:function(_7bb,_7bc){
return false;
},_getFilteredNodes:function(_7bd,_7be,_7bf){
var _7c0=[],n,i=_7bd,max=this._maxIncrement+Math.abs(i),chk=_7bf?-1:1,dec=_7bf?1:0,inc=_7bf?0:1;
do{
i=i-dec;
n=this._createOption(i);
if(n){
_7c0.push(n);
}
i=i+inc;
}while(_7c0.length<_7be&&(i*chk)<max);
if(_7bf){
_7c0.reverse();
}
return _7c0;
},_showText:function(){
this.timeMenu.innerHTML="";
var _7c7=dojo.date.stamp.fromISOString;
this._clickableIncrementDate=_7c7(this.clickableIncrement);
this._visibleIncrementDate=_7c7(this.visibleIncrement);
this._visibleRangeDate=_7c7(this.visibleRange);
var _7c8=function(date){
return date.getHours()*60*60+date.getMinutes()*60+date.getSeconds();
};
var _7ca=_7c8(this._clickableIncrementDate);
var _7cb=_7c8(this._visibleIncrementDate);
var _7cc=_7c8(this._visibleRangeDate);
var time=this.value.getTime();
this._refDate=new Date(time-time%(_7cb*1000));
this._refDate.setFullYear(1970,0,1);
this._clickableIncrement=1;
this._totalIncrements=_7cc/_7ca;
this._visibleIncrement=_7cb/_7ca;
this._maxIncrement=(60*60*24)/_7ca;
var _7ce=this._getFilteredNodes(0,this._totalIncrements>>1,true);
var _7cf=this._getFilteredNodes(0,this._totalIncrements>>1,false);
if(_7ce.length<this._totalIncrements>>1){
_7ce=_7ce.slice(_7ce.length/2);
_7cf=_7cf.slice(0,_7cf.length/2);
}
dojo.forEach(_7ce.concat(_7cf),function(n){
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
var _7d1=this;
var _7d2=function(){
_7d1._connects.push(dijit.typematic.addMouseListener.apply(null,arguments));
};
_7d2(this.upArrow,this,this._onArrowUp,1,50);
_7d2(this.downArrow,this,this._onArrowDown,1,50);
var _7d3=function(cb){
return function(cnt){
if(cnt>0){
cb.call(this,arguments);
}
};
};
var _7d6=function(node,cb){
return function(e){
dojo.stopEvent(e);
dijit.typematic.trigger(e,this,node,_7d3(cb),node,1,50);
};
};
this.connect(this.upArrow,"onmouseover",_7d6(this.upArrow,this._onArrowUp));
this.connect(this.downArrow,"onmouseover",_7d6(this.downArrow,this._onArrowDown));
this.inherited(arguments);
},_buttonMouse:function(e){
dojo.toggleClass(e.currentTarget,"dijitButtonNodeHover",e.type=="mouseover");
},_createOption:function(_7db){
var date=new Date(this._refDate);
var _7dd=this._clickableIncrementDate;
date.setHours(date.getHours()+_7dd.getHours()*_7db,date.getMinutes()+_7dd.getMinutes()*_7db,date.getSeconds()+_7dd.getSeconds()*_7db);
var _7de=dojo.date.locale.format(date,this.constraints);
if(this._filterString&&_7de.toLowerCase().indexOf(this._filterString)!==0){
return null;
}
var div=dojo.create("div",{"class":this.baseClass+"Item"});
div.date=date;
div.index=_7db;
dojo.create("div",{"class":this.baseClass+"ItemInner",innerHTML:_7de},div);
if(_7db%this._visibleIncrement<1&&_7db%this._visibleIncrement>-1){
dojo.addClass(div,this.baseClass+"Marker");
}else{
if(!(_7db%this._clickableIncrement)){
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
var _7e1=tgt.target.date||tgt.target.parentNode.date;
if(!_7e1||this.isDisabledDate(_7e1)){
return;
}
this._highlighted_option=null;
this.attr("value",_7e1);
this.onValueSelected(_7e1);
},onValueSelected:function(time){
},_highlightOption:function(node,_7e4){
if(!node){
return;
}
if(_7e4){
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
dojo.toggleClass(node,this.baseClass+"ItemHover",_7e4);
if(dojo.hasClass(node,this.baseClass+"Marker")){
dojo.toggleClass(node,this.baseClass+"MarkerHover",_7e4);
}else{
dojo.toggleClass(node,this.baseClass+"TickHover",_7e4);
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
var _7ea=(dojo.isIE?e.wheelDelta:-e.detail);
this[(_7ea>0?"_onArrowUp":"_onArrowDown")]();
},_onArrowUp:function(_7eb){
if(typeof _7eb=="number"&&_7eb==-1){
return;
}
if(!this.timeMenu.childNodes.length){
return;
}
var _7ec=this.timeMenu.childNodes[0].index;
var divs=this._getFilteredNodes(_7ec,1,true);
if(divs.length){
this.timeMenu.removeChild(this.timeMenu.childNodes[this.timeMenu.childNodes.length-1]);
this.timeMenu.insertBefore(divs[0],this.timeMenu.childNodes[0]);
}
},_onArrowDown:function(_7ee){
if(typeof _7ee=="number"&&_7ee==-1){
return;
}
if(!this.timeMenu.childNodes.length){
return;
}
var _7ef=this.timeMenu.childNodes[this.timeMenu.childNodes.length-1].index+1;
var divs=this._getFilteredNodes(_7ef,1,false);
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
var _7f3=this.timeMenu,tgt=this._highlighted_option||dojo.query("."+this.baseClass+"ItemSelected",_7f3)[0];
if(!tgt){
tgt=_7f3.childNodes[0];
}else{
if(_7f3.childNodes.length){
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
if(!dojo._hasResource["dijit.form._DateTimeTextBox"]){
dojo._hasResource["dijit.form._DateTimeTextBox"]=true;
dojo.provide("dijit.form._DateTimeTextBox");
dojo.declare("dijit.form._DateTimeTextBox",dijit.form.RangeBoundTextBox,{regExpGen:dojo.date.locale.regexp,compare:dojo.date.compare,format:function(_7f5,_7f6){
if(!_7f5){
return "";
}
return dojo.date.locale.format(_7f5,_7f6);
},parse:function(_7f7,_7f8){
return dojo.date.locale.parse(_7f7,_7f8)||(this._isEmpty(_7f7)?null:undefined);
},serialize:dojo.date.stamp.toISOString,value:new Date(""),_blankValue:null,popupClass:"",_selector:"",postMixInProperties:function(){
this.inherited(arguments);
if(!this.value||this.value.toString()==dijit.form._DateTimeTextBox.prototype.value.toString()){
this.value=null;
}
var _7f9=this.constraints;
_7f9.selector=this._selector;
_7f9.fullYear=true;
var _7fa=dojo.date.stamp.fromISOString;
if(typeof _7f9.min=="string"){
_7f9.min=_7fa(_7f9.min);
}
if(typeof _7f9.max=="string"){
_7f9.max=_7fa(_7f9.max);
}
},_onFocus:function(evt){
this._open();
},_setValueAttr:function(_7fc,_7fd,_7fe){
this.inherited(arguments);
if(this._picker){
if(!_7fc){
_7fc=new Date();
}
this._picker.attr("value",_7fc);
}
},_open:function(){
if(this.disabled||this.readOnly||!this.popupClass){
return;
}
var _7ff=this;
if(!this._picker){
var _800=dojo.getObject(this.popupClass,false);
this._picker=new _800({onValueSelected:function(_801){
if(_7ff._tabbingAway){
delete _7ff._tabbingAway;
}else{
_7ff.focus();
}
setTimeout(dojo.hitch(_7ff,"_close"),1);
dijit.form._DateTimeTextBox.superclass._setValueAttr.call(_7ff,_801,true);
},lang:_7ff.lang,constraints:_7ff.constraints,isDisabledDate:function(date){
var _803=dojo.date.compare;
var _804=_7ff.constraints;
return _804&&(_804.min&&(_803(_804.min,date,"date")>0)||(_804.max&&_803(_804.max,date,"date")<0));
}});
this._picker.attr("value",this.attr("value")||new Date());
}
if(!this._opened){
dijit.popup.open({parent:this,popup:this._picker,around:this.domNode,onCancel:dojo.hitch(this,this._close),onClose:function(){
_7ff._opened=false;
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
},_setDisplayedValueAttr:function(_805,_806){
this._setValueAttr(this.parse(_805,this.constraints),_806,_805);
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
if(!dojo._hasResource["dijit.form.TimeTextBox"]){
dojo._hasResource["dijit.form.TimeTextBox"]=true;
dojo.provide("dijit.form.TimeTextBox");
dojo.declare("dijit.form.TimeTextBox",dijit.form._DateTimeTextBox,{baseClass:"dijitTextBox dijitTimeTextBox",popupClass:"dijit._TimePicker",_selector:"time",value:new Date("")});
}
if(!dojo._hasResource["dijit._Calendar"]){
dojo._hasResource["dijit._Calendar"]=true;
dojo.provide("dijit._Calendar");
dojo.declare("dijit._Calendar",[dijit._Widget,dijit._Templated],{templateString:"<table cellspacing=\"0\" cellpadding=\"0\" class=\"dijitCalendarContainer\">\r\n\t<thead>\r\n\t\t<tr class=\"dijitReset dijitCalendarMonthContainer\" valign=\"top\">\r\n\t\t\t<th class='dijitReset' dojoAttachPoint=\"decrementMonth\">\r\n\t\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitCalendarIncrementControl dijitCalendarDecrease\" waiRole=\"presentation\">\r\n\t\t\t\t<span dojoAttachPoint=\"decreaseArrowNode\" class=\"dijitA11ySideArrow\">-</span>\r\n\t\t\t</th>\r\n\t\t\t<th class='dijitReset' colspan=\"5\">\r\n\t\t\t\t<div dojoAttachPoint=\"monthLabelSpacer\" class=\"dijitCalendarMonthLabelSpacer\"></div>\r\n\t\t\t\t<div dojoAttachPoint=\"monthLabelNode\" class=\"dijitCalendarMonthLabel\"></div>\r\n\t\t\t</th>\r\n\t\t\t<th class='dijitReset' dojoAttachPoint=\"incrementMonth\">\r\n\t\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitCalendarIncrementControl dijitCalendarIncrease\" waiRole=\"presentation\">\r\n\t\t\t\t<span dojoAttachPoint=\"increaseArrowNode\" class=\"dijitA11ySideArrow\">+</span>\r\n\t\t\t</th>\r\n\t\t</tr>\r\n\t\t<tr>\r\n\t\t\t<th class=\"dijitReset dijitCalendarDayLabelTemplate\"><span class=\"dijitCalendarDayLabel\"></span></th>\r\n\t\t</tr>\r\n\t</thead>\r\n\t<tbody dojoAttachEvent=\"onclick: _onDayClick, onmouseover: _onDayMouseOver, onmouseout: _onDayMouseOut\" class=\"dijitReset dijitCalendarBodyContainer\">\r\n\t\t<tr class=\"dijitReset dijitCalendarWeekTemplate\">\r\n\t\t\t<td class=\"dijitReset dijitCalendarDateTemplate\"><span class=\"dijitCalendarDateLabel\"></span></td>\r\n\t\t</tr>\r\n\t</tbody>\r\n\t<tfoot class=\"dijitReset dijitCalendarYearContainer\">\r\n\t\t<tr>\r\n\t\t\t<td class='dijitReset' valign=\"top\" colspan=\"7\">\r\n\t\t\t\t<h3 class=\"dijitCalendarYearLabel\">\r\n\t\t\t\t\t<span dojoAttachPoint=\"previousYearLabelNode\" class=\"dijitInline dijitCalendarPreviousYear\"></span>\r\n\t\t\t\t\t<span dojoAttachPoint=\"currentYearLabelNode\" class=\"dijitInline dijitCalendarSelectedYear\"></span>\r\n\t\t\t\t\t<span dojoAttachPoint=\"nextYearLabelNode\" class=\"dijitInline dijitCalendarNextYear\"></span>\r\n\t\t\t\t</h3>\r\n\t\t\t</td>\r\n\t\t</tr>\r\n\t</tfoot>\r\n</table>\t\r\n",value:new Date(),dayWidth:"narrow",setValue:function(_80a){
dojo.deprecated("dijit.Calendar:setValue() is deprecated.  Use attr('value', ...) instead.","","2.0");
this.attr("value",_80a);
},_getValueAttr:function(_80b){
var _80b=new Date(this.value);
_80b.setHours(0,0,0,0);
if(_80b.getDate()<this.value.getDate()){
_80b=dojo.date.add(_80b,"hour",1);
}
return _80b;
},_setValueAttr:function(_80c){
if(!this.value||dojo.date.compare(_80c,this.value)){
_80c=new Date(_80c);
_80c.setHours(1);
this.displayMonth=new Date(_80c);
if(!this.isDisabledDate(_80c,this.lang)){
this.value=_80c;
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
var _80f=this.displayMonth;
_80f.setDate(1);
var _810=_80f.getDay();
var _811=dojo.date.getDaysInMonth(_80f);
var _812=dojo.date.getDaysInMonth(dojo.date.add(_80f,"month",-1));
var _813=new Date();
var _814=this.value;
var _815=dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
if(_815>_810){
_815-=7;
}
dojo.query(".dijitCalendarDateTemplate",this.domNode).forEach(function(_816,i){
i+=_815;
var date=new Date(_80f);
var _819,_81a="dijitCalendar",adj=0;
if(i<_810){
_819=_812-_810+i+1;
adj=-1;
_81a+="Previous";
}else{
if(i>=(_810+_811)){
_819=i-_810-_811+1;
adj=1;
_81a+="Next";
}else{
_819=i-_810+1;
_81a+="Current";
}
}
if(adj){
date=dojo.date.add(date,"month",adj);
}
date.setDate(_819);
if(!dojo.date.compare(date,_813,"date")){
_81a="dijitCalendarCurrentDate "+_81a;
}
if(!dojo.date.compare(date,_814,"date")){
_81a="dijitCalendarSelectedDate "+_81a;
}
if(this.isDisabledDate(date,this.lang)){
_81a="dijitCalendarDisabledDate "+_81a;
}
var _81c=this.getClassForDate(date,this.lang);
if(_81c){
_81a=_81c+" "+_81a;
}
_816.className=_81a+"Month dijitCalendarDateTemplate";
_816.dijitDateValue=date.valueOf();
var _81d=dojo.query(".dijitCalendarDateLabel",_816)[0];
this._setText(_81d,date.getDate());
},this);
var _81e=dojo.date.locale.getNames("months","wide","standAlone",this.lang);
this._setText(this.monthLabelNode,_81e[_80f.getMonth()]);
var y=_80f.getFullYear()-1;
var d=new Date();
dojo.forEach(["previous","current","next"],function(name){
d.setFullYear(y++);
this._setText(this[name+"YearLabelNode"],dojo.date.locale.format(d,{selector:"year",locale:this.lang}));
},this);
var _822=this;
var _823=function(_824,_825,adj){
_822._connects.push(dijit.typematic.addMouseListener(_822[_824],_822,function(_827){
if(_827>=0){
_822._adjustDisplay(_825,adj);
}
},0.8,500));
};
_823("incrementMonth","month",1);
_823("decrementMonth","month",-1);
_823("nextYearLabelNode","year",1);
_823("previousYearLabelNode","year",-1);
},goToToday:function(){
this.attr("value",new Date());
},postCreate:function(){
this.inherited(arguments);
dojo.setSelectable(this.domNode,false);
var _828=dojo.hitch(this,function(_829,n){
var _82b=dojo.query(_829,this.domNode)[0];
for(var i=0;i<n;i++){
_82b.parentNode.appendChild(_82b.cloneNode(true));
}
});
_828(".dijitCalendarDayLabelTemplate",6);
_828(".dijitCalendarDateTemplate",6);
_828(".dijitCalendarWeekTemplate",5);
var _82d=dojo.date.locale.getNames("days",this.dayWidth,"standAlone",this.lang);
var _82e=dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
dojo.query(".dijitCalendarDayLabel",this.domNode).forEach(function(_82f,i){
this._setText(_82f,_82d[(i+_82e)%7]);
},this);
var _831=dojo.date.locale.getNames("months","wide","standAlone",this.lang);
dojo.forEach(_831,function(name){
var _833=dojo.create("div",null,this.monthLabelSpacer);
this._setText(_833,name);
},this);
this.value=null;
this.attr("value",new Date());
},_adjustDisplay:function(part,_835){
this.displayMonth=dojo.date.add(this.displayMonth,part,_835);
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
},isDisabledDate:function(_83e,_83f){
},getClassForDate:function(_840,_841){
}});
}
if(!dojo._hasResource["dijit.form.DateTextBox"]){
dojo._hasResource["dijit.form.DateTextBox"]=true;
dojo.provide("dijit.form.DateTextBox");
dojo.declare("dijit.form.DateTextBox",dijit.form._DateTimeTextBox,{baseClass:"dijitTextBox dijitDateTextBox",popupClass:"dijit._Calendar",_selector:"date",value:new Date("")});
}
if(!dojo._hasResource["dojo.number"]){
dojo._hasResource["dojo.number"]=true;
dojo.provide("dojo.number");
dojo.number.format=function(_842,_843){
_843=dojo.mixin({},_843||{});
var _844=dojo.i18n.normalizeLocale(_843.locale);
var _845=dojo.i18n.getLocalization("dojo.cldr","number",_844);
_843.customs=_845;
var _846=_843.pattern||_845[(_843.type||"decimal")+"Format"];
if(isNaN(_842)||Math.abs(_842)==Infinity){
return null;
}
return dojo.number._applyPattern(_842,_846,_843);
};
dojo.number._numberPatternRE=/[#0,]*[#0](?:\.0*#*)?/;
dojo.number._applyPattern=function(_847,_848,_849){
_849=_849||{};
var _84a=_849.customs.group;
var _84b=_849.customs.decimal;
var _84c=_848.split(";");
var _84d=_84c[0];
_848=_84c[(_847<0)?1:0]||("-"+_84d);
if(_848.indexOf("%")!=-1){
_847*=100;
}else{
if(_848.indexOf("‰")!=-1){
_847*=1000;
}else{
if(_848.indexOf("¤")!=-1){
_84a=_849.customs.currencyGroup||_84a;
_84b=_849.customs.currencyDecimal||_84b;
_848=_848.replace(/\u00a4{1,3}/,function(_84e){
var prop=["symbol","currency","displayName"][_84e.length-1];
return _849[prop]||_849.currency||"";
});
}else{
if(_848.indexOf("E")!=-1){
throw new Error("exponential notation not supported");
}
}
}
}
var _850=dojo.number._numberPatternRE;
var _851=_84d.match(_850);
if(!_851){
throw new Error("unable to find a number expression in pattern: "+_848);
}
if(_849.fractional===false){
_849.places=0;
}
return _848.replace(_850,dojo.number._formatAbsolute(_847,_851[0],{decimal:_84b,group:_84a,places:_849.places,round:_849.round}));
};
dojo.number.round=function(_852,_853,_854){
var _855=10/(_854||10);
return (_855*+_852).toFixed(_853)/_855;
};
if((0.9).toFixed()==0){
(function(){
var _856=dojo.number.round;
dojo.number.round=function(v,p,m){
var d=Math.pow(10,-p||0),a=Math.abs(v);
if(!v||a>=d||a*Math.pow(10,p+1)<5){
d=0;
}
return _856(v,p,m)+(v>0?d:-d);
};
})();
}
dojo.number._formatAbsolute=function(_85c,_85d,_85e){
_85e=_85e||{};
if(_85e.places===true){
_85e.places=0;
}
if(_85e.places===Infinity){
_85e.places=6;
}
var _85f=_85d.split(".");
var _860=(_85e.places>=0)?_85e.places:(_85f[1]&&_85f[1].length)||0;
if(!(_85e.round<0)){
_85c=dojo.number.round(_85c,_860,_85e.round);
}
var _861=String(Math.abs(_85c)).split(".");
var _862=_861[1]||"";
if(_85e.places){
var _863=dojo.isString(_85e.places)&&_85e.places.indexOf(",");
if(_863){
_85e.places=_85e.places.substring(_863+1);
}
_861[1]=dojo.string.pad(_862.substr(0,_85e.places),_85e.places,"0",true);
}else{
if(_85f[1]&&_85e.places!==0){
var pad=_85f[1].lastIndexOf("0")+1;
if(pad>_862.length){
_861[1]=dojo.string.pad(_862,pad,"0",true);
}
var _865=_85f[1].length;
if(_865<_862.length){
_861[1]=_862.substr(0,_865);
}
}else{
if(_861[1]){
_861.pop();
}
}
}
var _866=_85f[0].replace(",","");
pad=_866.indexOf("0");
if(pad!=-1){
pad=_866.length-pad;
if(pad>_861[0].length){
_861[0]=dojo.string.pad(_861[0],pad);
}
if(_866.indexOf("#")==-1){
_861[0]=_861[0].substr(_861[0].length-pad);
}
}
var _867=_85f[0].lastIndexOf(",");
var _868,_869;
if(_867!=-1){
_868=_85f[0].length-_867-1;
var _86a=_85f[0].substr(0,_867);
_867=_86a.lastIndexOf(",");
if(_867!=-1){
_869=_86a.length-_867-1;
}
}
var _86b=[];
for(var _86c=_861[0];_86c;){
var off=_86c.length-_868;
_86b.push((off>0)?_86c.substr(off):_86c);
_86c=(off>0)?_86c.slice(0,off):"";
if(_869){
_868=_869;
delete _869;
}
}
_861[0]=_86b.reverse().join(_85e.group||",");
return _861.join(_85e.decimal||".");
};
dojo.number.regexp=function(_86e){
return dojo.number._parseInfo(_86e).regexp;
};
dojo.number._parseInfo=function(_86f){
_86f=_86f||{};
var _870=dojo.i18n.normalizeLocale(_86f.locale);
var _871=dojo.i18n.getLocalization("dojo.cldr","number",_870);
var _872=_86f.pattern||_871[(_86f.type||"decimal")+"Format"];
var _873=_871.group;
var _874=_871.decimal;
var _875=1;
if(_872.indexOf("%")!=-1){
_875/=100;
}else{
if(_872.indexOf("‰")!=-1){
_875/=1000;
}else{
var _876=_872.indexOf("¤")!=-1;
if(_876){
_873=_871.currencyGroup||_873;
_874=_871.currencyDecimal||_874;
}
}
}
var _877=_872.split(";");
if(_877.length==1){
_877.push("-"+_877[0]);
}
var re=dojo.regexp.buildGroupRE(_877,function(_879){
_879="(?:"+dojo.regexp.escapeString(_879,".")+")";
return _879.replace(dojo.number._numberPatternRE,function(_87a){
var _87b={signed:false,separator:_86f.strict?_873:[_873,""],fractional:_86f.fractional,decimal:_874,exponent:false};
var _87c=_87a.split(".");
var _87d=_86f.places;
if(_87c.length==1||_87d===0){
_87b.fractional=false;
}else{
if(_87d===undefined){
_87d=_86f.pattern?_87c[1].lastIndexOf("0")+1:Infinity;
}
if(_87d&&_86f.fractional==undefined){
_87b.fractional=true;
}
if(!_86f.places&&(_87d<_87c[1].length)){
_87d+=","+_87c[1].length;
}
_87b.places=_87d;
}
var _87e=_87c[0].split(",");
if(_87e.length>1){
_87b.groupSize=_87e.pop().length;
if(_87e.length>1){
_87b.groupSize2=_87e.pop().length;
}
}
return "("+dojo.number._realNumberRegexp(_87b)+")";
});
},true);
if(_876){
re=re.replace(/([\s\xa0]*)(\u00a4{1,3})([\s\xa0]*)/g,function(_87f,_880,_881,_882){
var prop=["symbol","currency","displayName"][_881.length-1];
var _884=dojo.regexp.escapeString(_86f[prop]||_86f.currency||"");
_880=_880?"[\\s\\xa0]":"";
_882=_882?"[\\s\\xa0]":"";
if(!_86f.strict){
if(_880){
_880+="*";
}
if(_882){
_882+="*";
}
return "(?:"+_880+_884+_882+")?";
}
return _880+_884+_882;
});
}
return {regexp:re.replace(/[\xa0 ]/g,"[\\s\\xa0]"),group:_873,decimal:_874,factor:_875};
};
dojo.number.parse=function(_885,_886){
var info=dojo.number._parseInfo(_886);
var _888=(new RegExp("^"+info.regexp+"$")).exec(_885);
if(!_888){
return NaN;
}
var _889=_888[1];
if(!_888[1]){
if(!_888[2]){
return NaN;
}
_889=_888[2];
info.factor*=-1;
}
_889=_889.replace(new RegExp("["+info.group+"\\s\\xa0"+"]","g"),"").replace(info.decimal,".");
return _889*info.factor;
};
dojo.number._realNumberRegexp=function(_88a){
_88a=_88a||{};
if(!("places" in _88a)){
_88a.places=Infinity;
}
if(typeof _88a.decimal!="string"){
_88a.decimal=".";
}
if(!("fractional" in _88a)||/^0/.test(_88a.places)){
_88a.fractional=[true,false];
}
if(!("exponent" in _88a)){
_88a.exponent=[true,false];
}
if(!("eSigned" in _88a)){
_88a.eSigned=[true,false];
}
var _88b=dojo.number._integerRegexp(_88a);
var _88c=dojo.regexp.buildGroupRE(_88a.fractional,function(q){
var re="";
if(q&&(_88a.places!==0)){
re="\\"+_88a.decimal;
if(_88a.places==Infinity){
re="(?:"+re+"\\d+)?";
}else{
re+="\\d{"+_88a.places+"}";
}
}
return re;
},true);
var _88f=dojo.regexp.buildGroupRE(_88a.exponent,function(q){
if(q){
return "([eE]"+dojo.number._integerRegexp({signed:_88a.eSigned})+")";
}
return "";
});
var _891=_88b+_88c;
if(_88c){
_891="(?:(?:"+_891+")|(?:"+_88c+"))";
}
return _891+_88f;
};
dojo.number._integerRegexp=function(_892){
_892=_892||{};
if(!("signed" in _892)){
_892.signed=[true,false];
}
if(!("separator" in _892)){
_892.separator="";
}else{
if(!("groupSize" in _892)){
_892.groupSize=3;
}
}
var _893=dojo.regexp.buildGroupRE(_892.signed,function(q){
return q?"[-+]":"";
},true);
var _895=dojo.regexp.buildGroupRE(_892.separator,function(sep){
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
var grp=_892.groupSize,grp2=_892.groupSize2;
if(grp2){
var _899="(?:0|[1-9]\\d{0,"+(grp2-1)+"}(?:["+sep+"]\\d{"+grp2+"})*["+sep+"]\\d{"+grp+"})";
return ((grp-grp2)>0)?"(?:"+_899+"|(?:0|[1-9]\\d{0,"+(grp-1)+"}))":_899;
}
return "(?:0|[1-9]\\d{0,"+(grp-1)+"}(?:["+sep+"]\\d{"+grp+"})*)";
},true);
return _893+_895;
};
}
if(!dojo._hasResource["dijit.ProgressBar"]){
dojo._hasResource["dijit.ProgressBar"]=true;
dojo.provide("dijit.ProgressBar");
dojo.declare("dijit.ProgressBar",[dijit._Widget,dijit._Templated],{progress:"0",maximum:100,places:0,indeterminate:false,templateString:"<div class=\"dijitProgressBar dijitProgressBarEmpty\"\r\n\t><div waiRole=\"progressbar\" tabindex=\"0\" dojoAttachPoint=\"internalProgress\" class=\"dijitProgressBarFull\"\r\n\t\t><div class=\"dijitProgressBarTile\"></div\r\n\t\t><span style=\"visibility:hidden\">&nbsp;</span\r\n\t></div\r\n\t><div dojoAttachPoint=\"label\" class=\"dijitProgressBarLabel\" id=\"${id}_label\">&nbsp;</div\r\n\t><img dojoAttachPoint=\"indeterminateHighContrastImage\" class=\"dijitProgressBarIndeterminateHighContrastImage\"\r\n\t></img\r\n></div>\r\n",_indeterminateHighContrastImagePath:dojo.moduleUrl("dijit","themes/a11y/indeterminate_progress.gif"),postCreate:function(){
this.inherited(arguments);
this.indeterminateHighContrastImage.setAttribute("src",this._indeterminateHighContrastImagePath);
this.update();
},update:function(_89a){
dojo.mixin(this,_89a||{});
var tip=this.internalProgress;
var _89c=1,_89d;
if(this.indeterminate){
_89d="addClass";
dijit.removeWaiState(tip,"valuenow");
dijit.removeWaiState(tip,"valuemin");
dijit.removeWaiState(tip,"valuemax");
}else{
_89d="removeClass";
if(String(this.progress).indexOf("%")!=-1){
_89c=Math.min(parseFloat(this.progress)/100,1);
this.progress=_89c*this.maximum;
}else{
this.progress=Math.min(this.progress,this.maximum);
_89c=this.progress/this.maximum;
}
var text=this.report(_89c);
this.label.firstChild.nodeValue=text;
dijit.setWaiState(tip,"describedby",this.label.id);
dijit.setWaiState(tip,"valuenow",this.progress);
dijit.setWaiState(tip,"valuemin",0);
dijit.setWaiState(tip,"valuemax",this.maximum);
}
dojo[_89d](this.domNode,"dijitProgressBarIndeterminate");
tip.style.width=(_89c*100)+"%";
this.onChange();
},report:function(_89f){
return dojo.number.format(_89f,{type:"percent",places:this.places,locale:this.lang});
},onChange:function(){
}});
}
if(!dojo._hasResource["dojo.cookie"]){
dojo._hasResource["dojo.cookie"]=true;
dojo.provide("dojo.cookie");
dojo.cookie=function(name,_8a1,_8a2){
var c=document.cookie;
if(arguments.length==1){
var _8a4=c.match(new RegExp("(?:^|; )"+dojo.regexp.escapeString(name)+"=([^;]*)"));
return _8a4?decodeURIComponent(_8a4[1]):undefined;
}else{
_8a2=_8a2||{};
var exp=_8a2.expires;
if(typeof exp=="number"){
var d=new Date();
d.setTime(d.getTime()+exp*24*60*60*1000);
exp=_8a2.expires=d;
}
if(exp&&exp.toUTCString){
_8a2.expires=exp.toUTCString();
}
_8a1=encodeURIComponent(_8a1);
var _8a7=name+"="+_8a1,_8a8;
for(_8a8 in _8a2){
_8a7+="; "+_8a8;
var _8a9=_8a2[_8a8];
if(_8a9!==true){
_8a7+="="+_8a9;
}
}
document.cookie=_8a7;
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
},_setupChild:function(_8aa){
var _8ab=_8aa.region;
if(_8ab){
this.inherited(arguments);
dojo.addClass(_8aa.domNode,this.baseClass+"Pane");
var ltr=this.isLeftToRight();
if(_8ab=="leading"){
_8ab=ltr?"left":"right";
}
if(_8ab=="trailing"){
_8ab=ltr?"right":"left";
}
this["_"+_8ab]=_8aa.domNode;
this["_"+_8ab+"Widget"]=_8aa;
if((_8aa.splitter||this.gutters)&&!this._splitters[_8ab]){
var _8ad=dojo.getObject(_8aa.splitter?this._splitterClass:"dijit.layout._Gutter");
var flip={left:"right",right:"left",top:"bottom",bottom:"top",leading:"trailing",trailing:"leading"};
var _8af=new _8ad({container:this,child:_8aa,region:_8ab,oppNode:this["_"+flip[_8aa.region]],live:this.liveSplitters});
_8af.isSplitter=true;
this._splitters[_8ab]=_8af.domNode;
dojo.place(this._splitters[_8ab],_8aa.domNode,"after");
_8af.startup();
}
_8aa.region=_8ab;
}
},_computeSplitterThickness:function(_8b0){
this._splitterThickness[_8b0]=this._splitterThickness[_8b0]||dojo.marginBox(this._splitters[_8b0])[(/top|bottom/.test(_8b0)?"h":"w")];
},layout:function(){
for(var _8b1 in this._splitters){
this._computeSplitterThickness(_8b1);
}
this._layoutChildren();
},addChild:function(_8b2,_8b3){
this.inherited(arguments);
if(this._started){
this._layoutChildren();
}
},removeChild:function(_8b4){
var _8b5=_8b4.region;
var _8b6=this._splitters[_8b5];
if(_8b6){
dijit.byNode(_8b6).destroy();
delete this._splitters[_8b5];
delete this._splitterThickness[_8b5];
}
this.inherited(arguments);
delete this["_"+_8b5];
delete this["_"+_8b5+"Widget"];
if(this._started){
this._layoutChildren(_8b4.region);
}
dojo.removeClass(_8b4.domNode,this.baseClass+"Pane");
},getChildren:function(){
return dojo.filter(this.inherited(arguments),function(_8b7){
return !_8b7.isSplitter;
});
},getSplitter:function(_8b8){
var _8b9=this._splitters[_8b8];
return _8b9?dijit.byNode(_8b9):null;
},resize:function(_8ba,_8bb){
if(!this.cs||!this.pe){
var node=this.domNode;
this.cs=dojo.getComputedStyle(node);
this.pe=dojo._getPadExtents(node,this.cs);
this.pe.r=dojo._toPixelValue(node,this.cs.paddingRight);
this.pe.b=dojo._toPixelValue(node,this.cs.paddingBottom);
dojo.style(node,"padding","0px");
}
this.inherited(arguments);
},_layoutChildren:function(_8bd){
if(!this._borderBox||!this._borderBox.h){
return;
}
var _8be=(this.design=="sidebar");
var _8bf=0,_8c0=0,_8c1=0,_8c2=0;
var _8c3={},_8c4={},_8c5={},_8c6={},_8c7=(this._center&&this._center.style)||{};
var _8c8=/left|right/.test(_8bd);
var _8c9=!_8bd||(!_8c8&&!_8be);
var _8ca=!_8bd||(_8c8&&_8be);
if(this._top){
_8c3=_8ca&&this._top.style;
_8bf=dojo.marginBox(this._top).h;
}
if(this._left){
_8c4=_8c9&&this._left.style;
_8c1=dojo.marginBox(this._left).w;
}
if(this._right){
_8c5=_8c9&&this._right.style;
_8c2=dojo.marginBox(this._right).w;
}
if(this._bottom){
_8c6=_8ca&&this._bottom.style;
_8c0=dojo.marginBox(this._bottom).h;
}
var _8cb=this._splitters;
var _8cc=_8cb.top,_8cd=_8cb.bottom,_8ce=_8cb.left,_8cf=_8cb.right;
var _8d0=this._splitterThickness;
var _8d1=_8d0.top||0,_8d2=_8d0.left||0,_8d3=_8d0.right||0,_8d4=_8d0.bottom||0;
if(_8d2>50||_8d3>50){
setTimeout(dojo.hitch(this,function(){
this._splitterThickness={};
for(var _8d5 in this._splitters){
this._computeSplitterThickness(_8d5);
}
this._layoutChildren();
}),50);
return false;
}
var pe=this.pe;
var _8d7={left:(_8be?_8c1+_8d2:0)+pe.l+"px",right:(_8be?_8c2+_8d3:0)+pe.r+"px"};
if(_8cc){
dojo.mixin(_8cc.style,_8d7);
_8cc.style.top=_8bf+pe.t+"px";
}
if(_8cd){
dojo.mixin(_8cd.style,_8d7);
_8cd.style.bottom=_8c0+pe.b+"px";
}
_8d7={top:(_8be?0:_8bf+_8d1)+pe.t+"px",bottom:(_8be?0:_8c0+_8d4)+pe.b+"px"};
if(_8ce){
dojo.mixin(_8ce.style,_8d7);
_8ce.style.left=_8c1+pe.l+"px";
}
if(_8cf){
dojo.mixin(_8cf.style,_8d7);
_8cf.style.right=_8c2+pe.r+"px";
}
dojo.mixin(_8c7,{top:pe.t+_8bf+_8d1+"px",left:pe.l+_8c1+_8d2+"px",right:pe.r+_8c2+_8d3+"px",bottom:pe.b+_8c0+_8d4+"px"});
var _8d8={top:_8be?pe.t+"px":_8c7.top,bottom:_8be?pe.b+"px":_8c7.bottom};
dojo.mixin(_8c4,_8d8);
dojo.mixin(_8c5,_8d8);
_8c4.left=pe.l+"px";
_8c5.right=pe.r+"px";
_8c3.top=pe.t+"px";
_8c6.bottom=pe.b+"px";
if(_8be){
_8c3.left=_8c6.left=_8c1+_8d2+pe.l+"px";
_8c3.right=_8c6.right=_8c2+_8d3+pe.r+"px";
}else{
_8c3.left=_8c6.left=pe.l+"px";
_8c3.right=_8c6.right=pe.r+"px";
}
var _8d9=this._borderBox.h-pe.t-pe.b,_8da=_8d9-(_8bf+_8d1+_8c0+_8d4),_8db=_8be?_8d9:_8da;
var _8dc=this._borderBox.w-pe.l-pe.r,_8dd=_8dc-(_8c1+_8d2+_8c2+_8d3),_8de=_8be?_8dd:_8dc;
var dim={top:{w:_8de,h:_8bf},bottom:{w:_8de,h:_8c0},left:{w:_8c1,h:_8db},right:{w:_8c2,h:_8db},center:{h:_8da,w:_8dd}};
var _8e0=dojo.isIE<8||(dojo.isIE&&dojo.isQuirks)||dojo.some(this.getChildren(),function(_8e1){
return _8e1.domNode.tagName=="TEXTAREA"||_8e1.domNode.tagName=="INPUT";
});
if(_8e0){
var _8e2=function(_8e3,_8e4,_8e5){
if(_8e3){
(_8e3.resize?_8e3.resize(_8e4,_8e5):dojo.marginBox(_8e3.domNode,_8e4));
}
};
if(_8ce){
_8ce.style.height=_8db;
}
if(_8cf){
_8cf.style.height=_8db;
}
_8e2(this._leftWidget,{h:_8db},dim.left);
_8e2(this._rightWidget,{h:_8db},dim.right);
if(_8cc){
_8cc.style.width=_8de;
}
if(_8cd){
_8cd.style.width=_8de;
}
_8e2(this._topWidget,{w:_8de},dim.top);
_8e2(this._bottomWidget,{w:_8de},dim.bottom);
_8e2(this._centerWidget,dim.center);
}else{
var _8e6={};
if(_8bd){
_8e6[_8bd]=_8e6.center=true;
if(/top|bottom/.test(_8bd)&&this.design!="sidebar"){
_8e6.left=_8e6.right=true;
}else{
if(/left|right/.test(_8bd)&&this.design=="sidebar"){
_8e6.top=_8e6.bottom=true;
}
}
}
dojo.forEach(this.getChildren(),function(_8e7){
if(_8e7.resize&&(!_8bd||_8e7.region in _8e6)){
_8e7.resize(null,dim[_8e7.region]);
}
},this);
}
},destroy:function(){
for(var _8e8 in this._splitters){
var _8e9=this._splitters[_8e8];
dijit.byNode(_8e9).destroy();
dojo.destroy(_8e9);
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
var _8ea=dojo.cookie(this._cookieName);
if(_8ea){
this.child.domNode.style[this.horizontal?"height":"width"]=_8ea;
}
}
},_computeMaxSize:function(){
var dim=this.horizontal?"h":"w",_8ec=this.container._splitterThickness[this.region];
var _8ed=dojo.contentBox(this.container.domNode)[dim]-(this.oppNode?dojo.marginBox(this.oppNode)[dim]:0)-20-_8ec*2;
this._maxSize=Math.min(this.child.maxSize,_8ed);
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
var _8ef=this._factor,max=this._maxSize,min=this._minSize||20,_8f2=this.horizontal,axis=_8f2?"pageY":"pageX",_8f4=e[axis],_8f5=this.domNode.style,dim=_8f2?"h":"w",_8f7=dojo.marginBox(this.child.domNode)[dim],_8f8=this.region,_8f9=parseInt(this.domNode.style[_8f8],10),_8fa=this._resize,mb={},_8fc=this.child.domNode,_8fd=dojo.hitch(this.container,this.container._layoutChildren),de=dojo.doc.body;
this._handlers=(this._handlers||[]).concat([dojo.connect(de,"onmousemove",this._drag=function(e,_900){
var _901=e[axis]-_8f4,_902=_8ef*_901+_8f7,_903=Math.max(Math.min(_902,max),min);
if(_8fa||_900){
mb[dim]=_903;
dojo.marginBox(_8fc,mb);
_8fd(_8f8);
}
_8f5[_8f8]=_8ef*_901+_8f9+(_903-_902)+"px";
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
var _906=this.horizontal;
var tick=1;
var dk=dojo.keys;
switch(e.charOrCode){
case _906?dk.UP_ARROW:dk.LEFT_ARROW:
tick*=-1;
case _906?dk.DOWN_ARROW:dk.RIGHT_ARROW:
break;
default:
return;
}
var _909=dojo.marginBox(this.child.domNode)[_906?"h":"w"]+this._factor*tick;
var mb={};
mb[this.horizontal?"h":"w"]=Math.max(Math.min(_909,this._maxSize),this._minSize);
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
dojo.declare("dijit._KeyNavContainer",[dijit._Container],{tabIndex:"0",_keyNavCodes:{},connectKeyNavHandlers:function(_90b,_90c){
var _90d=this._keyNavCodes={};
var prev=dojo.hitch(this,this.focusPrev);
var next=dojo.hitch(this,this.focusNext);
dojo.forEach(_90b,function(code){
_90d[code]=prev;
});
dojo.forEach(_90c,function(code){
_90d[code]=next;
});
this.connect(this.domNode,"onkeypress","_onContainerKeypress");
this.connect(this.domNode,"onfocus","_onContainerFocus");
},startupKeyNavChildren:function(){
dojo.forEach(this.getChildren(),dojo.hitch(this,"_startupChild"));
},addChild:function(_912,_913){
dijit._KeyNavContainer.superclass.addChild.apply(this,arguments);
this._startupChild(_912);
},focus:function(){
this.focusFirstChild();
},focusFirstChild:function(){
this.focusChild(this._getFirstFocusableChild());
},focusNext:function(){
if(this.focusedChild&&this.focusedChild.hasNextFocalNode&&this.focusedChild.hasNextFocalNode()){
this.focusedChild.focusNext();
return;
}
var _914=this._getNextFocusableChild(this.focusedChild,1);
if(_914.getFocalNodes){
this.focusChild(_914,_914.getFocalNodes()[0]);
}else{
this.focusChild(_914);
}
},focusPrev:function(){
if(this.focusedChild&&this.focusedChild.hasPrevFocalNode&&this.focusedChild.hasPrevFocalNode()){
this.focusedChild.focusPrev();
return;
}
var _915=this._getNextFocusableChild(this.focusedChild,-1);
if(_915.getFocalNodes){
var _916=_915.getFocalNodes();
this.focusChild(_915,_916[_916.length-1]);
}else{
this.focusChild(_915);
}
},focusChild:function(_917,node){
if(_917){
if(this.focusedChild&&_917!==this.focusedChild){
this._onChildBlur(this.focusedChild);
}
this.focusedChild=_917;
if(node&&_917.focusFocalNode){
_917.focusFocalNode(node);
}else{
_917.focus();
}
}
},_startupChild:function(_919){
if(_919.getFocalNodes){
dojo.forEach(_919.getFocalNodes(),function(node){
dojo.attr(node,"tabindex",-1);
this._connectNode(node);
},this);
}else{
var node=_919.focusNode||_919.domNode;
if(_919.isFocusable()){
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
var _922=dijit.getEnclosingWidget(evt.target);
if(_922&&_922.isFocusable()){
this.focusedChild=_922;
}
dojo.stopEvent(evt);
},_onNodeBlur:function(evt){
dojo.stopEvent(evt);
},_onChildBlur:function(_924){
},_getFirstFocusableChild:function(){
return this._getNextFocusableChild(null,1);
},_getNextFocusableChild:function(_925,dir){
if(_925){
_925=this._getSiblingOfChild(_925,dir);
}
var _927=this.getChildren();
for(var i=0;i<_927.length;i++){
if(!_925){
_925=_927[(dir>0)?0:(_927.length-1)];
}
if(_925.isFocusable()){
return _925;
}
_925=this._getSiblingOfChild(_925,dir);
}
return null;
}});
}
if(!dojo._hasResource["dijit.MenuItem"]){
dojo._hasResource["dijit.MenuItem"]=true;
dojo.provide("dijit.MenuItem");
dojo.declare("dijit.MenuItem",[dijit._Widget,dijit._Templated,dijit._Contained],{templateString:"<tr class=\"dijitReset dijitMenuItem\" dojoAttachPoint=\"focusNode\" waiRole=\"menuitem\" tabIndex=\"-1\"\r\n\t\tdojoAttachEvent=\"onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick\">\r\n\t<td class=\"dijitReset\" waiRole=\"presentation\">\r\n\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitMenuItemIcon\" dojoAttachPoint=\"iconNode\">\r\n\t</td>\r\n\t<td class=\"dijitReset dijitMenuItemLabel\" colspan=\"2\" dojoAttachPoint=\"containerNode\"></td>\r\n\t<td class=\"dijitReset dijitMenuItemAccelKey\" style=\"display: none\" dojoAttachPoint=\"accelKeyNode\"></td>\r\n\t<td class=\"dijitReset dijitMenuArrowCell\" waiRole=\"presentation\">\r\n\t\t<div dojoAttachPoint=\"arrowWrapper\" style=\"visibility: hidden\">\r\n\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitMenuExpand\">\r\n\t\t\t<span class=\"dijitMenuExpandA11y\">+</span>\r\n\t\t</div>\r\n\t</td>\r\n</tr>\r\n",attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap,{label:{node:"containerNode",type:"innerHTML"},iconClass:{node:"iconNode",type:"class"}}),label:"",iconClass:"",accelKey:"",disabled:false,_fillContent:function(_929){
if(_929&&!("label" in this.params)){
this.attr("label",_929.innerHTML);
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
},_setSelected:function(_92c){
dojo.toggleClass(this.domNode,"dijitMenuItemSelected",_92c);
},setLabel:function(_92d){
dojo.deprecated("dijit.MenuItem.setLabel() is deprecated.  Use attr('label', ...) instead.","","2.0");
this.attr("label",_92d);
},setDisabled:function(_92e){
dojo.deprecated("dijit.Menu.setDisabled() is deprecated.  Use attr('disabled', bool) instead.","","2.0");
this.attr("disabled",_92e);
},_setDisabledAttr:function(_92f){
this.disabled=_92f;
dojo[_92f?"addClass":"removeClass"](this.domNode,"dijitMenuItemDisabled");
dijit.setWaiState(this.focusNode,"disabled",_92f?"true":"false");
},_setAccelKeyAttr:function(_930){
this.accelKey=_930;
this.accelKeyNode.style.display=_930?"":"none";
this.accelKeyNode.innerHTML=_930;
dojo.attr(this.containerNode,"colSpan",_930?"1":"2");
}});
}
if(!dojo._hasResource["dijit.PopupMenuItem"]){
dojo._hasResource["dijit.PopupMenuItem"]=true;
dojo.provide("dijit.PopupMenuItem");
dojo.declare("dijit.PopupMenuItem",dijit.MenuItem,{_fillContent:function(){
if(this.srcNodeRef){
var _931=dojo.query("*",this.srcNodeRef);
dijit.PopupMenuItem.superclass._fillContent.call(this,_931[0]);
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
dojo.declare("dijit.CheckedMenuItem",dijit.MenuItem,{templateString:"<tr class=\"dijitReset dijitMenuItem\" dojoAttachPoint=\"focusNode\" waiRole=\"menuitemcheckbox\" tabIndex=\"-1\"\r\n\t\tdojoAttachEvent=\"onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick\">\r\n\t<td class=\"dijitReset\" waiRole=\"presentation\">\r\n\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitMenuItemIcon dijitCheckedMenuItemIcon\" dojoAttachPoint=\"iconNode\">\r\n\t\t<span class=\"dijitCheckedMenuItemIconChar\">&#10003;</span>\r\n\t</td>\r\n\t<td class=\"dijitReset dijitMenuItemLabel\" colspan=\"2\" dojoAttachPoint=\"containerNode,labelNode\"></td>\r\n\t<td class=\"dijitReset dijitMenuItemAccelKey\" style=\"display: none\" dojoAttachPoint=\"accelKeyNode\"></td>\r\n\t<td class=\"dijitReset dijitMenuArrowCell\" waiRole=\"presentation\">\r\n\t</td>\r\n</tr>\r\n",checked:false,_setCheckedAttr:function(_933){
dojo.toggleClass(this.domNode,"dijitCheckedMenuItemChecked",_933);
dijit.setWaiState(this.domNode,"checked",_933);
this.checked=_933;
},onChange:function(_934){
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
dojo.forEach(this.getChildren(),function(_936){
_936.startup();
});
this.startupKeyNavChildren();
this.inherited(arguments);
},onExecute:function(){
},onCancel:function(_937){
},_moveToPopup:function(evt){
if(this.focusedChild&&this.focusedChild.popup&&!this.focusedChild.disabled){
this.focusedChild._onClick(evt);
}else{
var _939=this._getTopMenu();
if(_939&&_939._isMenuBar){
_939.focusNext();
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
var _940=this.focusedChild;
var _941=_940.popup;
if(_941.isShowingNow){
return;
}
_941.parentMenu=this;
var self=this;
dijit.popup.open({parent:this,popup:_941,around:_940.domNode,orient:this._orient||(this.isLeftToRight()?{"TR":"TL","TL":"TR"}:{"TL":"TR","TR":"TL"}),onCancel:function(){
dijit.popup.close(_941);
_940.focus();
self.currentPopup=null;
},onExecute:dojo.hitch(this,"_onDescendantExecute")});
this.currentPopup=_941;
if(_941.focus){
setTimeout(dojo.hitch(_941,"focus"),0);
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
},_iframeContentWindow:function(_947){
var win=dijit.getDocumentWindow(dijit.Menu._iframeContentDocument(_947))||dijit.Menu._iframeContentDocument(_947)["__parent__"]||(_947.name&&dojo.doc.frames[_947.name])||null;
return win;
},_iframeContentDocument:function(_949){
var doc=_949.contentDocument||(_949.contentWindow&&_949.contentWindow.document)||(_949.name&&dojo.doc.frames[_949.name]&&dojo.doc.frames[_949.name].document)||null;
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
},unBindDomNode:function(_94e){
var node=dojo.byId(_94e);
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
var _958=dojo.coords(e.target,true);
x=_958.x+10;
y=_958.y+10;
}
var self=this;
var _95a=dijit.getFocus(this);
function _95b(){
dijit.focus(_95a);
dijit.popup.close(self);
};
dijit.popup.open({popup:this,x:x,y:y,onExecute:_95b,onCancel:_95b,orient:this.isLeftToRight()?"L":"R"});
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
},onAddChild:function(page,_95f){
var _960=dojo.doc.createElement("span");
this.domNode.appendChild(_960);
var cls=dojo.getObject(this.buttonWidget);
var _962=new cls({label:page.title,closeButton:page.closable},_960);
this.addChild(_962,_95f);
this.pane2button[page]=_962;
page.controlButton=_962;
var _963=[];
_963.push(dojo.connect(_962,"onClick",dojo.hitch(this,"onButtonClick",page)));
if(page.closable){
_963.push(dojo.connect(_962,"onClickCloseButton",dojo.hitch(this,"onCloseButtonClick",page)));
var _964=dojo.i18n.getLocalization("dijit","common");
var _965=new dijit.Menu({targetNodeIds:[_962.id],id:_962.id+"_Menu"});
var _966=new dijit.MenuItem({label:_964.itemClose});
_963.push(dojo.connect(_966,"onClick",dojo.hitch(this,"onCloseButtonClick",page)));
_965.addChild(_966);
this.pane2menu[page]=_965;
}
this.pane2handles[page]=_963;
if(!this._currentChild){
_962.focusNode.setAttribute("tabIndex","0");
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
var _969=this.pane2button[page];
if(_969){
_969.destroy();
delete this.pane2button[page];
}
},onSelectChild:function(page){
if(!page){
return;
}
if(this._currentChild){
var _96b=this.pane2button[this._currentChild];
_96b.attr("checked",false);
_96b.focusNode.setAttribute("tabIndex","-1");
}
var _96c=this.pane2button[page];
_96c.attr("checked",true);
this._currentChild=page;
_96c.focusNode.setAttribute("tabIndex","0");
var _96d=dijit.byId(this.containerId);
dijit.setWaiState(_96d.containerNode,"labelledby",_96c.id);
},onButtonClick:function(page){
var _96f=dijit.byId(this.containerId);
_96f.selectChild(page);
},onCloseButtonClick:function(page){
var _971=dijit.byId(this.containerId);
_971.closeChild(page);
var b=this.pane2button[this._currentChild];
if(b){
dijit.focus(b.focusNode||b.domNode);
}
},adjacent:function(_973){
if(!this.isLeftToRight()&&(!this.tabPosition||/top|bottom/.test(this.tabPosition))){
_973=!_973;
}
var _974=this.getChildren();
var _975=dojo.indexOf(_974,this.pane2button[this._currentChild]);
var _976=_973?1:_974.length-1;
return _974[(_975+_976)%_974.length];
},onkeypress:function(e){
if(this.disabled||e.altKey){
return;
}
var _978=null;
if(e.ctrlKey||!e._djpage){
var k=dojo.keys;
switch(e.charOrCode){
case k.LEFT_ARROW:
case k.UP_ARROW:
if(!e._djpage){
_978=false;
}
break;
case k.PAGE_UP:
if(e.ctrlKey){
_978=false;
}
break;
case k.RIGHT_ARROW:
case k.DOWN_ARROW:
if(!e._djpage){
_978=true;
}
break;
case k.PAGE_DOWN:
if(e.ctrlKey){
_978=true;
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
if(_978!==null){
this.adjacent(_978).onClick();
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
var _97e=this.getChildren();
dojo.forEach(_97e,this._setupChild,this);
if(this.persist){
this.selectedChildWidget=dijit.byId(dojo.cookie(this.id+"_selectedChild"));
}else{
dojo.some(_97e,function(_97f){
if(_97f.selected){
this.selectedChildWidget=_97f;
}
return _97f.selected;
},this);
}
var _980=this.selectedChildWidget;
if(!_980&&_97e[0]){
_980=this.selectedChildWidget=_97e[0];
_980.selected=true;
}
dojo.publish(this.id+"-startup",[{children:_97e,selected:_980}]);
if(_980){
this._showChild(_980);
}
this.inherited(arguments);
},_setupChild:function(_981){
this.inherited(arguments);
dojo.removeClass(_981.domNode,"dijitVisible");
dojo.addClass(_981.domNode,"dijitHidden");
_981.domNode.title="";
return _981;
},addChild:function(_982,_983){
this.inherited(arguments);
if(this._started){
dojo.publish(this.id+"-addChild",[_982,_983]);
this.layout();
if(!this.selectedChildWidget){
this.selectChild(_982);
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
var _985=this.getChildren();
if(_985.length){
this.selectChild(_985[0]);
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
},_transition:function(_987,_988){
if(_988){
this._hideChild(_988);
}
this._showChild(_987);
if(this.doLayout&&_987.resize){
_987.resize(this._containerContentBox||this._contentBox);
}
},_adjacent:function(_989){
var _98a=this.getChildren();
var _98b=dojo.indexOf(_98a,this.selectedChildWidget);
_98b+=_989?1:_98a.length-1;
return _98a[_98b%_98a.length];
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
var _98e=this.getChildren();
page.isFirstChild=(page==_98e[0]);
page.isLastChild=(page==_98e[_98e.length-1]);
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
var _991=page.onClose(this,page);
if(_991){
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
var _992=this.selectedChildWidget.containerNode.style;
_992.display="";
_992.overflow="auto";
this.selectedChildWidget._buttonWidget._setSelectedState(true);
}
},_getTargetHeight:function(node){
var cs=dojo.getComputedStyle(node);
return Math.max(this._verticalSpace-dojo._getPadBorderExtents(node,cs).h,0);
},layout:function(){
var _995=this.selectedChildWidget;
var _996=0;
dojo.forEach(this.getChildren(),function(_997){
_996+=_997._buttonWidget.getTitleHeight();
});
var _998=this._contentBox;
this._verticalSpace=_998.h-_996;
this._containerContentBox={h:this._verticalSpace,w:_998.w};
if(_995){
_995.resize(this._containerContentBox);
}
},_setupChild:function(_999){
_999._buttonWidget=new dijit.layout._AccordionButton({contentWidget:_999,title:_999.title,id:_999.id+"_button",parent:this});
dojo.place(_999._buttonWidget.domNode,_999.domNode,"before");
this.inherited(arguments);
},removeChild:function(_99a){
_99a._buttonWidget.destroy();
this.inherited(arguments);
},getChildren:function(){
return dojo.filter(this.inherited(arguments),function(_99b){
return _99b.declaredClass!="dijit.layout._AccordionButton";
});
},destroy:function(){
dojo.forEach(this.getChildren(),function(_99c){
_99c._buttonWidget.destroy();
});
this.inherited(arguments);
},_transition:function(_99d,_99e){
if(this._inTransition){
return;
}
this._inTransition=true;
var _99f=[];
var _9a0=this._verticalSpace;
if(_99d){
_99d._buttonWidget.setSelected(true);
this._showChild(_99d);
if(this.doLayout&&_99d.resize){
_99d.resize(this._containerContentBox);
}
var _9a1=_99d.domNode;
dojo.addClass(_9a1,"dijitVisible");
dojo.removeClass(_9a1,"dijitHidden");
var _9a2=_9a1.style.overflow;
_9a1.style.overflow="hidden";
_99f.push(dojo.animateProperty({node:_9a1,duration:this.duration,properties:{height:{start:1,end:this._getTargetHeight(_9a1)}},onEnd:dojo.hitch(this,function(){
_9a1.style.overflow=_9a2;
delete this._inTransition;
})}));
}
if(_99e){
_99e._buttonWidget.setSelected(false);
var _9a3=_99e.domNode,_9a4=_9a3.style.overflow;
_9a3.style.overflow="hidden";
_99f.push(dojo.animateProperty({node:_9a3,duration:this.duration,properties:{height:{start:this._getTargetHeight(_9a3),end:1}},onEnd:function(){
dojo.addClass(_9a3,"dijitHidden");
dojo.removeClass(_9a3,"dijitVisible");
_9a3.style.overflow=_9a4;
if(_99e.onHide){
_99e.onHide();
}
}}));
}
dojo.fx.combine(_99f).play();
},_onKeyPress:function(e,_9a6){
if(this._inTransition||this.disabled||e.altKey||!(_9a6||e.ctrlKey)){
if(this._inTransition){
dojo.stopEvent(e);
}
return;
}
var k=dojo.keys,c=e.charOrCode;
if((_9a6&&(c==k.LEFT_ARROW||c==k.UP_ARROW))||(e.ctrlKey&&c==k.PAGE_UP)){
this._adjacent(false)._buttonWidget._onTitleClick();
dojo.stopEvent(e);
}else{
if((_9a6&&(c==k.RIGHT_ARROW||c==k.DOWN_ARROW))||(e.ctrlKey&&(c==k.PAGE_DOWN||c==k.TAB))){
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
var _9a9=dojo.attr(this.domNode,"id").replace(" ","_");
dojo.attr(this.titleTextNode,"id",_9a9+"_title");
dijit.setWaiState(this.focusNode,"labelledby",dojo.attr(this.titleTextNode,"id"));
},getTitleHeight:function(){
return dojo.marginBox(this.titleNode).h;
},_onTitleClick:function(){
var _9aa=this.getParent();
if(!_9aa._inTransition){
_9aa.selectChild(this.contentWidget);
dijit.focus(this.focusNode);
}
},_onTitleEnter:function(){
dojo.addClass(this.focusNode,"dijitAccordionTitle-hover");
},_onTitleLeave:function(){
dojo.removeClass(this.focusNode,"dijitAccordionTitle-hover");
},_onTitleKeyPress:function(evt){
return this.getParent()._onKeyPress(evt,this.contentWidget);
},_setSelectedState:function(_9ac){
this.selected=_9ac;
dojo[(_9ac?"addClass":"removeClass")](this.titleNode,"dijitAccordionTitle-selected");
dijit.setWaiState(this.focusNode,"expanded",_9ac);
dijit.setWaiState(this.focusNode,"selected",_9ac);
this.focusNode.setAttribute("tabIndex",_9ac?"0":"-1");
},_handleFocus:function(e){
dojo[(e.type=="focus"?"addClass":"removeClass")](this.focusNode,"dijitAccordionFocused");
},setSelected:function(_9ae){
this._setSelectedState(_9ae);
if(_9ae){
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
var _9b0=0;
for(var pane in this.pane2button){
var ow=this.pane2button[pane].innerDiv.scrollWidth;
_9b0=Math.max(_9b0,ow);
}
for(pane in this.pane2button){
this.pane2button[pane].innerDiv.style.width=_9b0+"px";
}
}});
dojo.declare("dijit.layout._TabButton",dijit.layout._StackButton,{baseClass:"dijitTab",templateString:"<div waiRole=\"presentation\" dojoAttachEvent='onclick:onClick,onmouseenter:_onMouse,onmouseleave:_onMouse'>\r\n    <div waiRole=\"presentation\" class='dijitTabInnerDiv' dojoAttachPoint='innerDiv'>\r\n        <div waiRole=\"presentation\" class='dijitTabContent' dojoAttachPoint='tabContent'>\r\n\t        <span dojoAttachPoint='containerNode,focusNode' class='tabLabel'>${!label}</span><img class =\"dijitTabButtonSpacer\" src=\"${_blankGif}\" />\r\n\t        <span class=\"closeButton\" dojoAttachPoint='closeNode'\r\n\t        \t\tdojoAttachEvent='onclick: onClickCloseButton, onmouseenter: _onCloseButtonEnter, onmouseleave: _onCloseButtonLeave'>\r\n\t        \t<img src=\"${_blankGif}\" alt=\"\" dojoAttachPoint='closeIcon' class='closeImage' waiRole=\"presentation\"/>\r\n\t            <span dojoAttachPoint='closeText' class='closeText'>x</span>\r\n\t        </span>\r\n        </div>\r\n    </div>\r\n</div>\r\n",scrollOnFocus:false,postCreate:function(){
if(this.closeButton){
dojo.addClass(this.innerDiv,"dijitClosable");
var _9b3=dojo.i18n.getLocalization("dijit","common");
if(this.closeNode){
dojo.attr(this.closeNode,"title",_9b3.itemClose);
dojo.attr(this.closeIcon,"title",_9b3.itemClose);
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
var _9b4=dojo.getObject(this._controllerWidget);
this.tablist=new _9b4({id:this.id+"_tablist",tabPosition:this.tabPosition,doLayout:this.doLayout,containerId:this.id,"class":this.baseClass+"-tabs"+(this.doLayout?"":" dijitTabNoLayout")},this.tablistNode);
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
var _9b6=this.tabPosition.replace(/-h/,"");
var _9b7=[{domNode:this.tablist.domNode,layoutAlign:_9b6},{domNode:this.tablistSpacer,layoutAlign:_9b6},{domNode:this.containerNode,layoutAlign:"client"}];
dijit.layout.layoutChildren(this.domNode,this._contentBox,_9b7);
this._containerContentBox=dijit.layout.marginBox2contentBox(this.containerNode,_9b7[2]);
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
var _9b9=this.store;
if(!_9b9.getFeatures()["dojo.data.api.Identity"]){
throw new Error("dijit.Tree: store must support dojo.data.Identity");
}
if(_9b9.getFeatures()["dojo.data.api.Notification"]){
this.connects=this.connects.concat([dojo.connect(_9b9,"onNew",this,"_onNewItem"),dojo.connect(_9b9,"onDelete",this,"_onDeleteItem"),dojo.connect(_9b9,"onSet",this,"_onSetItem")]);
}
},destroy:function(){
dojo.forEach(this.connects,dojo.disconnect);
},getRoot:function(_9ba,_9bb){
if(this.root){
_9ba(this.root);
}else{
this.store.fetch({query:this.query,onComplete:dojo.hitch(this,function(_9bc){
if(_9bc.length!=1){
throw new Error(this.declaredClass+": query "+dojo.toJson(this.query)+" returned "+_9bc.length+" items, but must return exactly one item");
}
this.root=_9bc[0];
_9ba(this.root);
}),onError:_9bb});
}
},mayHaveChildren:function(item){
return dojo.some(this.childrenAttrs,function(attr){
return this.store.hasAttribute(item,attr);
},this);
},getChildren:function(_9bf,_9c0,_9c1){
var _9c2=this.store;
var _9c3=[];
for(var i=0;i<this.childrenAttrs.length;i++){
var vals=_9c2.getValues(_9bf,this.childrenAttrs[i]);
_9c3=_9c3.concat(vals);
}
var _9c6=0;
dojo.forEach(_9c3,function(item){
if(!_9c2.isItemLoaded(item)){
_9c6++;
}
});
if(_9c6==0){
_9c0(_9c3);
}else{
var _9c8=function _9c8(item){
if(--_9c6==0){
_9c0(_9c3);
}
};
dojo.forEach(_9c3,function(item){
if(!_9c2.isItemLoaded(item)){
_9c2.loadItem({item:item,onItem:_9c8,onError:_9c1});
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
},newItem:function(args,_9ce){
var _9cf={parent:_9ce,attribute:this.childrenAttrs[0]};
return this.store.newItem(args,_9cf);
},pasteItem:function(_9d0,_9d1,_9d2,_9d3,_9d4){
var _9d5=this.store,_9d6=this.childrenAttrs[0];
if(_9d1){
dojo.forEach(this.childrenAttrs,function(attr){
if(_9d5.containsValue(_9d1,attr,_9d0)){
if(!_9d3){
var _9d8=dojo.filter(_9d5.getValues(_9d1,attr),function(x){
return x!=_9d0;
});
_9d5.setValues(_9d1,attr,_9d8);
}
_9d6=attr;
}
});
}
if(_9d2){
if(typeof _9d4=="number"){
var _9da=_9d5.getValues(_9d2,_9d6);
_9da.splice(_9d4,0,_9d0);
_9d5.setValues(_9d2,_9d6,_9da);
}else{
_9d5.setValues(_9d2,_9d6,_9d5.getValues(_9d2,_9d6).concat(_9d0));
}
}
},onChange:function(item){
},onChildrenChange:function(_9dc,_9dd){
},onDelete:function(_9de,_9df){
},_onNewItem:function(item,_9e1){
if(!_9e1){
return;
}
this.getChildren(_9e1.item,dojo.hitch(this,function(_9e2){
this.onChildrenChange(_9e1.item,_9e2);
}));
},_onDeleteItem:function(item){
this.onDelete(item);
},_onSetItem:function(item,_9e5,_9e6,_9e7){
if(dojo.indexOf(this.childrenAttrs,_9e5)!=-1){
this.getChildren(item,dojo.hitch(this,function(_9e8){
this.onChildrenChange(item,_9e8);
}));
}else{
this.onChange(item);
}
}});
}
if(!dojo._hasResource["dijit.tree.ForestStoreModel"]){
dojo._hasResource["dijit.tree.ForestStoreModel"]=true;
dojo.provide("dijit.tree.ForestStoreModel");
dojo.declare("dijit.tree.ForestStoreModel",dijit.tree.TreeStoreModel,{rootId:"$root$",rootLabel:"ROOT",query:null,constructor:function(_9e9){
this.root={store:this,root:true,id:_9e9.rootId,label:_9e9.rootLabel,children:_9e9.rootChildren};
},mayHaveChildren:function(item){
return item===this.root||this.inherited(arguments);
},getChildren:function(_9eb,_9ec,_9ed){
if(_9eb===this.root){
if(this.root.children){
_9ec(this.root.children);
}else{
this.store.fetch({query:this.query,onComplete:dojo.hitch(this,function(_9ee){
this.root.children=_9ee;
_9ec(_9ee);
}),onError:_9ed});
}
}else{
this.inherited(arguments);
}
},getIdentity:function(item){
return (item===this.root)?this.root.id:this.inherited(arguments);
},getLabel:function(item){
return (item===this.root)?this.root.label:this.inherited(arguments);
},newItem:function(args,_9f2){
if(_9f2===this.root){
this.onNewRootItem(args);
return this.store.newItem(args);
}else{
return this.inherited(arguments);
}
},onNewRootItem:function(args){
},pasteItem:function(_9f4,_9f5,_9f6,_9f7,_9f8){
if(_9f5===this.root){
if(!_9f7){
this.onLeaveRoot(_9f4);
}
}
dijit.tree.TreeStoreModel.prototype.pasteItem.call(this,_9f4,_9f5===this.root?null:_9f5,_9f6===this.root?null:_9f6,_9f7,_9f8);
if(_9f6===this.root){
this.onAddToRoot(_9f4);
}
},onAddToRoot:function(item){
console.log(this,": item ",item," added to root");
},onLeaveRoot:function(item){
console.log(this,": item ",item," removed from root");
},_requeryTop:function(){
var _9fb=this.root.children||[];
this.store.fetch({query:this.query,onComplete:dojo.hitch(this,function(_9fc){
this.root.children=_9fc;
if(_9fb.length!=_9fc.length||dojo.some(_9fb,function(item,idx){
return _9fc[idx]!=item;
})){
this.onChildrenChange(this.root,_9fc);
}
})});
},_onNewItem:function(item,_a00){
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
},_setIndentAttr:function(_a02){
this.indent=_a02;
var _a03=(Math.max(_a02,0)*19)+"px";
dojo.style(this.domNode,"backgroundPosition",_a03+" 0px");
dojo.style(this.rowNode,dojo._isBodyLtr()?"paddingLeft":"paddingRight",_a03);
dojo.forEach(this.getChildren(),function(_a04){
_a04.attr("indent",_a02+1);
});
},markProcessing:function(){
this.state="LOADING";
this._setExpando(true);
},unmarkProcessing:function(){
this._setExpando(false);
},_updateItemClasses:function(item){
var tree=this.tree,_a07=tree.model;
if(tree._v10Compat&&item===_a07.root){
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
var _a08=this.getParent();
if(!_a08||_a08.rowNode.style.display=="none"){
dojo.addClass(this.domNode,"dijitTreeIsRoot");
}else{
dojo.toggleClass(this.domNode,"dijitTreeIsLast",!this.getNextSibling());
}
},_setExpando:function(_a09){
var _a0a=["dijitTreeExpandoLoading","dijitTreeExpandoOpened","dijitTreeExpandoClosed","dijitTreeExpandoLeaf"];
var _a0b=["*","-","+","*"];
var idx=_a09?0:(this.isExpandable?(this.isExpanded?1:2):3);
dojo.forEach(_a0a,function(s){
dojo.removeClass(this.expandoNode,s);
},this);
dojo.addClass(this.expandoNode,_a0a[idx]);
this.expandoNodeText.innerHTML=_a0b[idx];
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
},setLabelNode:function(_a0e){
this.labelNode.innerHTML="";
this.labelNode.appendChild(dojo.doc.createTextNode(_a0e));
},indent:0,setChildItems:function(_a0f){
var tree=this.tree,_a11=tree.model;
this.getChildren().forEach(function(_a12){
dijit._Container.prototype.removeChild.call(this,_a12);
},this);
this.state="LOADED";
if(_a0f&&_a0f.length>0){
this.isExpandable=true;
dojo.forEach(_a0f,function(item){
var id=_a11.getIdentity(item),_a15=tree._itemNodeMap[id],node=(_a15&&!_a15.getParent())?_a15:this.tree._createTreeNode({item:item,tree:tree,isExpandable:_a11.mayHaveChildren(item),label:tree.getLabel(item),indent:this.indent+1});
if(_a15){
_a15.attr("indent",this.indent+1);
}
this.addChild(node);
tree._itemNodeMap[id]=node;
if(this.tree._state(item)){
tree._expandNode(node);
}
},this);
dojo.forEach(this.getChildren(),function(_a17,idx){
_a17._updateLayout();
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
var _a1b=this.getChildren();
if(_a1b.length==0){
this.isExpandable=false;
this.collapse();
}
dojo.forEach(_a1b,function(_a1c){
_a1c._updateLayout();
});
},makeExpandable:function(){
this.isExpandable=true;
this._setExpando(false);
},_onLabelFocus:function(evt){
dojo.addClass(this.labelNode,"dijitTreeLabelFocused");
this.tree._onNodeFocus(this);
},_onLabelBlur:function(evt){
dojo.removeClass(this.labelNode,"dijitTreeLabelFocused");
},setSelected:function(_a1f){
var _a20=this.labelNode;
_a20.setAttribute("tabIndex",_a1f?"0":"-1");
dijit.setWaiState(_a20,"selected",_a1f);
dojo.toggleClass(this.rowNode,"dijitTreeNodeSelected",_a1f);
},_onMouseEnter:function(evt){
dojo.addClass(this.rowNode,"dijitTreeNodeHover");
this.tree._onNodeMouseEnter(this,evt);
},_onMouseLeave:function(evt){
dojo.removeClass(this.rowNode,"dijitTreeNodeHover");
this.tree._onNodeMouseLeave(this,evt);
}});
dojo.declare("dijit.Tree",[dijit._Widget,dijit._Templated],{store:null,model:null,query:null,label:"",showRoot:true,childrenAttr:["children"],openOnClick:false,openOnDblClick:false,templateString:"<div class=\"dijitTreeContainer\" waiRole=\"tree\"\r\n\tdojoAttachEvent=\"onclick:_onClick,onkeypress:_onKeyPress,ondblclick:_onDblClick\">\r\n</div>\r\n",isExpandable:true,isTree:true,persist:true,dndController:null,dndParams:["onDndDrop","itemCreator","onDndCancel","checkAcceptance","checkItemAcceptance","dragThreshold","betweenThreshold"],onDndDrop:null,itemCreator:null,onDndCancel:null,checkAcceptance:null,checkItemAcceptance:null,dragThreshold:0,betweenThreshold:0,_publish:function(_a23,_a24){
dojo.publish(this.id,[dojo.mixin({tree:this,event:_a23},_a24||{})]);
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
var _a25={};
for(var i=0;i<this.dndParams.length;i++){
if(this[this.dndParams[i]]){
_a25[this.dndParams[i]]=this[this.dndParams[i]];
}
}
this.dndController=new this.dndController(this,_a25);
}
},_store2model:function(){
this._v10Compat=true;
dojo.deprecated("Tree: from version 2.0, should specify a model object rather than a store/query");
var _a27={id:this.id+"_ForestStoreModel",store:this.store,query:this.query,childrenAttrs:this.childrenAttr};
if(this.params.mayHaveChildren){
_a27.mayHaveChildren=dojo.hitch(this,"mayHaveChildren");
}
if(this.params.getItemChildren){
_a27.getChildren=dojo.hitch(this,function(item,_a29,_a2a){
this.getItemChildren((this._v10Compat&&item===this.model.root)?null:item,_a29,_a2a);
});
}
this.model=new dijit.tree.ForestStoreModel(_a27);
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
},getItemChildren:function(_a2f,_a30){
},getLabel:function(item){
return this.model.getLabel(item);
},getIconClass:function(item,_a33){
return (!item||this.model.mayHaveChildren(item))?(_a33?"dijitFolderOpened":"dijitFolderClosed"):"dijitLeaf";
},getLabelClass:function(item,_a35){
},getIconStyle:function(item,_a37){
},getLabelStyle:function(item,_a39){
},_onKeyPress:function(e){
if(e.altKey){
return;
}
var dk=dojo.keys;
var _a3c=dijit.getEnclosingWidget(e.target);
if(!_a3c){
return;
}
var key=e.charOrCode;
if(typeof key=="string"){
if(!e.altKey&&!e.ctrlKey&&!e.shiftKey&&!e.metaKey){
this._onLetterKeyNav({node:_a3c,key:key.toLowerCase()});
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
this[this._keyHandlerMap[key]]({node:_a3c,item:_a3c.item});
dojo.stopEvent(e);
}
}
},_onEnterKey:function(_a3f){
this._publish("execute",{item:_a3f.item,node:_a3f.node});
this.onClick(_a3f.item,_a3f.node);
},_onDownArrow:function(_a40){
var node=this._getNextNode(_a40.node);
if(node&&node.isTreeNode){
this.focusNode(node);
}
},_onUpArrow:function(_a42){
var node=_a42.node;
var _a44=node.getPreviousSibling();
if(_a44){
node=_a44;
while(node.isExpandable&&node.isExpanded&&node.hasChildren()){
var _a45=node.getChildren();
node=_a45[_a45.length-1];
}
}else{
var _a46=node.getParent();
if(!(!this.showRoot&&_a46===this.rootNode)){
node=_a46;
}
}
if(node&&node.isTreeNode){
this.focusNode(node);
}
},_onRightArrow:function(_a47){
var node=_a47.node;
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
},_onLeftArrow:function(_a49){
var node=_a49.node;
if(node.isExpandable&&node.isExpanded){
this._collapseNode(node);
}else{
var _a4b=node.getParent();
if(_a4b&&_a4b.isTreeNode&&!(!this.showRoot&&_a4b===this.rootNode)){
this.focusNode(_a4b);
}
}
},_onHomeKey:function(){
var node=this._getRootOrFirstNode();
if(node){
this.focusNode(node);
}
},_onEndKey:function(_a4d){
var node=this.rootNode;
while(node.isExpanded){
var c=node.getChildren();
node=c[c.length-1];
}
if(node&&node.isTreeNode){
this.focusNode(node);
}
},_onLetterKeyNav:function(_a50){
var node=_a50.node,_a52=node,key=_a50.key;
do{
node=this._getNextNode(node);
if(!node){
node=this._getRootOrFirstNode();
}
}while(node!==_a52&&(node.label.charAt(0).toLowerCase()!=key));
if(node&&node.isTreeNode){
if(node!==_a52){
this.focusNode(node);
}
}
},_onClick:function(e){
var _a55=e.target;
var _a56=dijit.getEnclosingWidget(_a55);
if(!_a56||!_a56.isTreeNode){
return;
}
if((this.openOnClick&&_a56.isExpandable)||(_a55==_a56.expandoNode||_a55==_a56.expandoNodeText)){
if(_a56.isExpandable){
this._onExpandoClick({node:_a56});
}
}else{
this._publish("execute",{item:_a56.item,node:_a56});
this.onClick(_a56.item,_a56);
this.focusNode(_a56);
}
dojo.stopEvent(e);
},_onDblClick:function(e){
var _a58=e.target;
var _a59=dijit.getEnclosingWidget(_a58);
if(!_a59||!_a59.isTreeNode){
return;
}
if((this.openOnDblClick&&_a59.isExpandable)||(_a58==_a59.expandoNode||_a58==_a59.expandoNodeText)){
if(_a59.isExpandable){
this._onExpandoClick({node:_a59});
}
}else{
this._publish("execute",{item:_a59.item,node:_a59});
this.onDblClick(_a59.item,_a59);
this.focusNode(_a59);
}
dojo.stopEvent(e);
},_onExpandoClick:function(_a5a){
var node=_a5a.node;
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
var _a65=node.getNextSibling();
if(_a65){
return _a65;
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
var _a68=this.model,item=node.item;
switch(node.state){
case "LOADING":
return;
case "UNCHECKED":
node.markProcessing();
var _a6a=this;
_a68.getChildren(item,function(_a6b){
node.unmarkProcessing();
node.setChildItems(_a6b);
_a6a._expandNode(node);
},function(err){
console.error(_a6a,": error loading root children: ",err);
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
var _a72=this.model,_a73=_a72.getIdentity(item),node=this._itemNodeMap[_a73];
if(node){
node.setLabelNode(this.getLabel(item));
node._updateItemClasses(item);
}
},_onItemChildrenChange:function(_a75,_a76){
var _a77=this.model,_a78=_a77.getIdentity(_a75),_a79=this._itemNodeMap[_a78];
if(_a79){
_a79.setChildItems(_a76);
}
},_onItemDelete:function(item){
var _a7b=this.model,_a7c=_a7b.getIdentity(item),node=this._itemNodeMap[_a7c];
if(node){
var _a7e=node.getParent();
if(_a7e){
_a7e.removeChild(node);
}
node.destroyRecursive();
delete this._itemNodeMap[_a7c];
}
},_initState:function(){
if(this.persist){
var _a7f=dojo.cookie(this.cookieName);
this._openedItemIds={};
if(_a7f){
dojo.forEach(_a7f.split(","),function(item){
this._openedItemIds[item]=true;
},this);
}
}
},_state:function(item,_a82){
if(!this.persist){
return false;
}
var id=this.model.getIdentity(item);
if(arguments.length===1){
return this._openedItemIds[id];
}
if(_a82){
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
dojox.xml.parser.parse=function(str,_a88){
var _a89=dojo.doc;
var doc;
_a88=_a88||"text/xml";
if(str&&dojo.trim(str)&&"DOMParser" in dojo.global){
var _a8b=new DOMParser();
doc=_a8b.parseFromString(str,_a88);
var de=doc.documentElement;
var _a8d="http://www.mozilla.org/newlayout/xml/parsererror.xml";
if(de.nodeName=="parsererror"&&de.namespaceURI==_a8d){
var _a8e=de.getElementsByTagNameNS(_a8d,"sourcetext")[0];
if(!_a8e){
_a8e=_a8e.firstChild.data;
}
throw new Error("Error parsing text "+nativeDoc.documentElement.firstChild.data+" \n"+_a8e);
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
if(_a89.implementation&&_a89.implementation.createDocument){
if(str&&dojo.trim(str)&&_a89.createElement){
var tmp=_a89.createElement("xml");
tmp.innerHTML=str;
var _a95=_a89.implementation.createDocument("foo","",null);
dojo.forEach(tmp.childNodes,function(_a96){
_a95.importNode(_a96,true);
});
return _a95;
}else{
return _a89.implementation.createDocument("","",null);
}
}
}
}
return null;
};
dojox.xml.parser.textContent=function(node,text){
if(arguments.length>1){
var _a99=node.ownerDocument||dojo.doc;
dojox.xml.parser.replaceChildren(node,_a99.createTextNode(text));
return text;
}else{
if(node.textContent!==undefined){
return node.textContent;
}
var _a9a="";
if(node){
dojo.forEach(node.childNodes,function(_a9b){
switch(_a9b.nodeType){
case 1:
case 5:
_a9a+=dojox.xml.parser.textContent(_a9b);
break;
case 3:
case 2:
case 4:
_a9a+=_a9b.nodeValue;
}
});
}
return _a9a;
}
};
dojox.xml.parser.replaceChildren=function(node,_a9d){
var _a9e=[];
if(dojo.isIE){
dojo.forEach(node.childNodes,function(_a9f){
_a9e.push(_a9f);
});
}
dojox.xml.parser.removeChildren(node);
dojo.forEach(_a9e,dojo.destroy);
if(!dojo.isArray(_a9d)){
node.appendChild(_a9d);
}else{
dojo.forEach(_a9d,function(_aa0){
node.appendChild(_aa0);
});
}
};
dojox.xml.parser.removeChildren=function(node){
var _aa2=node.childNodes.length;
while(node.hasChildNodes()){
node.removeChild(node.firstChild);
}
return _aa2;
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
dojox.data.dom.createDocument=function(str,_aa5){
dojo.deprecated("dojox.data.dom.createDocument()","Use dojox.xml.parser.parse() instead.","2.0");
try{
return dojox.xml.parser.parse(str,_aa5);
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
dojox.data.dom.replaceChildren=function(node,_aa9){
dojo.deprecated("dojox.data.dom.replaceChildren()","Use dojox.xml.parser.replaceChildren() instead.","2.0");
dojox.xml.parser.replaceChildren(node,_aa9);
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
},url:"",rootItem:"",keyAttribute:"",label:"",sendQuery:false,attributeMap:null,getValue:function(item,_aae,_aaf){
var _ab0=item.element;
var i;
var node;
if(_aae==="tagName"){
return _ab0.nodeName;
}else{
if(_aae==="childNodes"){
for(i=0;i<_ab0.childNodes.length;i++){
node=_ab0.childNodes[i];
if(node.nodeType===1){
return this._getItem(node);
}
}
return _aaf;
}else{
if(_aae==="text()"){
for(i=0;i<_ab0.childNodes.length;i++){
node=_ab0.childNodes[i];
if(node.nodeType===3||node.nodeType===4){
return node.nodeValue;
}
}
return _aaf;
}else{
_aae=this._getAttribute(_ab0.nodeName,_aae);
if(_aae.charAt(0)==="@"){
var name=_aae.substring(1);
var _ab4=_ab0.getAttribute(name);
return (_ab4!==undefined)?_ab4:_aaf;
}else{
for(i=0;i<_ab0.childNodes.length;i++){
node=_ab0.childNodes[i];
if(node.nodeType===1&&node.nodeName===_aae){
return this._getItem(node);
}
}
return _aaf;
}
}
}
}
},getValues:function(item,_ab6){
var _ab7=item.element;
var _ab8=[];
var i;
var node;
if(_ab6==="tagName"){
return [_ab7.nodeName];
}else{
if(_ab6==="childNodes"){
for(i=0;i<_ab7.childNodes.length;i++){
node=_ab7.childNodes[i];
if(node.nodeType===1){
_ab8.push(this._getItem(node));
}
}
return _ab8;
}else{
if(_ab6==="text()"){
var ec=_ab7.childNodes;
for(i=0;i<ec.length;i++){
node=ec[i];
if(node.nodeType===3||node.nodeType===4){
_ab8.push(node.nodeValue);
}
}
return _ab8;
}else{
_ab6=this._getAttribute(_ab7.nodeName,_ab6);
if(_ab6.charAt(0)==="@"){
var name=_ab6.substring(1);
var _abd=_ab7.getAttribute(name);
return (_abd!==undefined)?[_abd]:[];
}else{
for(i=0;i<_ab7.childNodes.length;i++){
node=_ab7.childNodes[i];
if(node.nodeType===1&&node.nodeName===_ab6){
_ab8.push(this._getItem(node));
}
}
return _ab8;
}
}
}
}
},getAttributes:function(item){
var _abf=item.element;
var _ac0=[];
var i;
_ac0.push("tagName");
if(_abf.childNodes.length>0){
var _ac2={};
var _ac3=true;
var text=false;
for(i=0;i<_abf.childNodes.length;i++){
var node=_abf.childNodes[i];
if(node.nodeType===1){
var name=node.nodeName;
if(!_ac2[name]){
_ac0.push(name);
_ac2[name]=name;
}
_ac3=true;
}else{
if(node.nodeType===3){
text=true;
}
}
}
if(_ac3){
_ac0.push("childNodes");
}
if(text){
_ac0.push("text()");
}
}
for(i=0;i<_abf.attributes.length;i++){
_ac0.push("@"+_abf.attributes[i].nodeName);
}
if(this._attributeMap){
for(var key in this._attributeMap){
i=key.indexOf(".");
if(i>0){
var _ac8=key.substring(0,i);
if(_ac8===_abf.nodeName){
_ac0.push(key.substring(i+1));
}
}else{
_ac0.push(key);
}
}
}
return _ac0;
},hasAttribute:function(item,_aca){
return (this.getValue(item,_aca)!==undefined);
},containsValue:function(item,_acc,_acd){
var _ace=this.getValues(item,_acc);
for(var i=0;i<_ace.length;i++){
if((typeof _acd==="string")){
if(_ace[i].toString&&_ace[i].toString()===_acd){
return true;
}
}else{
if(_ace[i]===_acd){
return true;
}
}
}
return false;
},isItem:function(_ad0){
if(_ad0&&_ad0.element&&_ad0.store&&_ad0.store===this){
return true;
}
return false;
},isItemLoaded:function(_ad1){
return this.isItem(_ad1);
},loadItem:function(_ad2){
},getFeatures:function(){
var _ad3={"dojo.data.api.Read":true,"dojo.data.api.Write":true};
if(!this.sendQuery||this.keyAttribute!==""){
_ad3["dojo.data.api.Identity"]=true;
}
return _ad3;
},getLabel:function(item){
if((this.label!=="")&&this.isItem(item)){
var _ad5=this.getValue(item,this.label);
if(_ad5){
return _ad5.toString();
}
}
return undefined;
},getLabelAttributes:function(item){
if(this.label!==""){
return [this.label];
}
return null;
},_fetchItems:function(_ad7,_ad8,_ad9){
var url=this._getFetchUrl(_ad7);
console.log("XmlStore._fetchItems(): url="+url);
if(!url){
_ad9(new Error("No URL specified."));
return;
}
var _adb=(!this.sendQuery?_ad7:{});
var self=this;
var _add={url:url,handleAs:"xml",preventCache:true};
var _ade=dojo.xhrGet(_add);
_ade.addCallback(function(data){
var _ae0=self._getItems(data,_adb);
console.log("XmlStore._fetchItems(): length="+(_ae0?_ae0.length:0));
if(_ae0&&_ae0.length>0){
_ad8(_ae0,_ad7);
}else{
_ad8([],_ad7);
}
});
_ade.addErrback(function(data){
_ad9(data,_ad7);
});
},_getFetchUrl:function(_ae2){
if(!this.sendQuery){
return this.url;
}
var _ae3=_ae2.query;
if(!_ae3){
return this.url;
}
if(dojo.isString(_ae3)){
return this.url+_ae3;
}
var _ae4="";
for(var name in _ae3){
var _ae6=_ae3[name];
if(_ae6){
if(_ae4){
_ae4+="&";
}
_ae4+=(name+"="+_ae6);
}
}
if(!_ae4){
return this.url;
}
var _ae7=this.url;
if(_ae7.indexOf("?")<0){
_ae7+="?";
}else{
_ae7+="&";
}
return _ae7+_ae4;
},_getItems:function(_ae8,_ae9){
var _aea=null;
if(_ae9){
_aea=_ae9.query;
}
var _aeb=[];
var _aec=null;
if(this.rootItem!==""){
_aec=dojo.query(this.rootItem,_ae8);
}else{
_aec=_ae8.documentElement.childNodes;
}
var deep=_ae9.queryOptions?_ae9.queryOptions.deep:false;
if(deep){
_aec=this._flattenNodes(_aec);
}
for(var i=0;i<_aec.length;i++){
var node=_aec[i];
if(node.nodeType!=1){
continue;
}
var item=this._getItem(node);
if(_aea){
var _af1=true;
var _af2=_ae9.queryOptions?_ae9.queryOptions.ignoreCase:false;
var _af3;
var _af4={};
for(var key in _aea){
_af3=_aea[key];
if(typeof _af3==="string"){
_af4[key]=dojo.data.util.filter.patternToRegExp(_af3,_af2);
}
}
for(var _af6 in _aea){
_af3=this.getValue(item,_af6);
if(_af3){
var _af7=_aea[_af6];
if((typeof _af3)==="string"&&(_af4[_af6])){
if((_af3.match(_af4[_af6]))!==null){
continue;
}
}else{
if((typeof _af3)==="object"){
if(_af3.toString&&(_af4[_af6])){
var _af8=_af3.toString();
if((_af8.match(_af4[_af6]))!==null){
continue;
}
}else{
if(_af7==="*"||_af7===_af3){
continue;
}
}
}
}
}
_af1=false;
break;
}
if(!_af1){
continue;
}
}
_aeb.push(item);
}
dojo.forEach(_aeb,function(item){
item.element.parentNode.removeChild(item.element);
},this);
return _aeb;
},_flattenNodes:function(_afa){
var _afb=[];
if(_afa){
var i;
for(i=0;i<_afa.length;i++){
var node=_afa[i];
_afb.push(node);
if(node.childNodes&&node.childNodes.length>0){
_afb=_afb.concat(this._flattenNodes(node.childNodes));
}
}
}
return _afb;
},close:function(_afe){
},newItem:function(_aff,_b00){
console.log("XmlStore.newItem()");
_aff=(_aff||{});
var _b01=_aff.tagName;
if(!_b01){
_b01=this.rootItem;
if(_b01===""){
return null;
}
}
var _b02=this._getDocument();
var _b03=_b02.createElement(_b01);
for(var _b04 in _aff){
var text;
if(_b04==="tagName"){
continue;
}else{
if(_b04==="text()"){
text=_b02.createTextNode(_aff[_b04]);
_b03.appendChild(text);
}else{
_b04=this._getAttribute(_b01,_b04);
if(_b04.charAt(0)==="@"){
var name=_b04.substring(1);
_b03.setAttribute(name,_aff[_b04]);
}else{
var _b07=_b02.createElement(_b04);
text=_b02.createTextNode(_aff[_b04]);
_b07.appendChild(text);
_b03.appendChild(_b07);
}
}
}
}
var item=this._getItem(_b03);
this._newItems.push(item);
var _b09=null;
if(_b00&&_b00.parent&&_b00.attribute){
_b09={item:_b00.parent,attribute:_b00.attribute,oldValue:undefined};
var _b0a=this.getValues(_b00.parent,_b00.attribute);
if(_b0a&&_b0a.length>0){
var _b0b=_b0a.slice(0,_b0a.length);
if(_b0a.length===1){
_b09.oldValue=_b0a[0];
}else{
_b09.oldValue=_b0a.slice(0,_b0a.length);
}
_b0b.push(item);
this.setValues(_b00.parent,_b00.attribute,_b0b);
_b09.newValue=this.getValues(_b00.parent,_b00.attribute);
}else{
this.setValues(_b00.parent,_b00.attribute,item);
_b09.newValue=item;
}
}
return item;
},deleteItem:function(item){
console.log("XmlStore.deleteItem()");
var _b0d=item.element;
if(_b0d.parentNode){
this._backupItem(item);
_b0d.parentNode.removeChild(_b0d);
return true;
}
this._forgetItem(item);
this._deletedItems.push(item);
return true;
},setValue:function(item,_b0f,_b10){
if(_b0f==="tagName"){
return false;
}
this._backupItem(item);
var _b11=item.element;
var _b12;
var text;
if(_b0f==="childNodes"){
_b12=_b10.element;
_b11.appendChild(_b12);
}else{
if(_b0f==="text()"){
while(_b11.firstChild){
_b11.removeChild(_b11.firstChild);
}
text=this._getDocument(_b11).createTextNode(_b10);
_b11.appendChild(text);
}else{
_b0f=this._getAttribute(_b11.nodeName,_b0f);
if(_b0f.charAt(0)==="@"){
var name=_b0f.substring(1);
_b11.setAttribute(name,_b10);
}else{
for(var i=0;i<_b11.childNodes.length;i++){
var node=_b11.childNodes[i];
if(node.nodeType===1&&node.nodeName===_b0f){
_b12=node;
break;
}
}
var _b17=this._getDocument(_b11);
if(_b12){
while(_b12.firstChild){
_b12.removeChild(_b12.firstChild);
}
}else{
_b12=_b17.createElement(_b0f);
_b11.appendChild(_b12);
}
text=_b17.createTextNode(_b10);
_b12.appendChild(text);
}
}
}
return true;
},setValues:function(item,_b19,_b1a){
if(_b19==="tagName"){
return false;
}
this._backupItem(item);
var _b1b=item.element;
var i;
var _b1d;
var text;
if(_b19==="childNodes"){
while(_b1b.firstChild){
_b1b.removeChild(_b1b.firstChild);
}
for(i=0;i<_b1a.length;i++){
_b1d=_b1a[i].element;
_b1b.appendChild(_b1d);
}
}else{
if(_b19==="text()"){
while(_b1b.firstChild){
_b1b.removeChild(_b1b.firstChild);
}
var _b1f="";
for(i=0;i<_b1a.length;i++){
_b1f+=_b1a[i];
}
text=this._getDocument(_b1b).createTextNode(_b1f);
_b1b.appendChild(text);
}else{
_b19=this._getAttribute(_b1b.nodeName,_b19);
if(_b19.charAt(0)==="@"){
var name=_b19.substring(1);
_b1b.setAttribute(name,_b1a[0]);
}else{
for(i=_b1b.childNodes.length-1;i>=0;i--){
var node=_b1b.childNodes[i];
if(node.nodeType===1&&node.nodeName===_b19){
_b1b.removeChild(node);
}
}
var _b22=this._getDocument(_b1b);
for(i=0;i<_b1a.length;i++){
_b1d=_b22.createElement(_b19);
text=_b22.createTextNode(_b1a[i]);
_b1d.appendChild(text);
_b1b.appendChild(_b1d);
}
}
}
}
return true;
},unsetAttribute:function(item,_b24){
if(_b24==="tagName"){
return false;
}
this._backupItem(item);
var _b25=item.element;
if(_b24==="childNodes"||_b24==="text()"){
while(_b25.firstChild){
_b25.removeChild(_b25.firstChild);
}
}else{
_b24=this._getAttribute(_b25.nodeName,_b24);
if(_b24.charAt(0)==="@"){
var name=_b24.substring(1);
_b25.removeAttribute(name);
}else{
for(var i=_b25.childNodes.length-1;i>=0;i--){
var node=_b25.childNodes[i];
if(node.nodeType===1&&node.nodeName===_b24){
_b25.removeChild(node);
}
}
}
}
return true;
},save:function(_b29){
if(!_b29){
_b29={};
}
var i;
for(i=0;i<this._modifiedItems.length;i++){
this._saveItem(this._modifiedItems[i],_b29,"PUT");
}
for(i=0;i<this._newItems.length;i++){
var item=this._newItems[i];
if(item.element.parentNode){
this._newItems.splice(i,1);
i--;
continue;
}
this._saveItem(this._newItems[i],_b29,"POST");
}
for(i=0;i<this._deletedItems.length;i++){
this._saveItem(this._deletedItems[i],_b29,"DELETE");
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
var _b2d=this._getRootElement(item.element);
return (this._getItemIndex(this._newItems,_b2d)>=0||this._getItemIndex(this._deletedItems,_b2d)>=0||this._getItemIndex(this._modifiedItems,_b2d)>=0);
}else{
return (this._newItems.length>0||this._deletedItems.length>0||this._modifiedItems.length>0);
}
},_saveItem:function(item,_b2f,_b30){
var url;
var _b32;
if(_b30==="PUT"){
url=this._getPutUrl(item);
}else{
if(_b30==="DELETE"){
url=this._getDeleteUrl(item);
}else{
url=this._getPostUrl(item);
}
}
if(!url){
if(_b2f.onError){
_b32=_b2f.scope||dojo.global;
_b2f.onError.call(_b32,new Error("No URL for saving content: "+this._getPostContent(item)));
}
return;
}
var _b33={url:url,method:(_b30||"POST"),contentType:"text/xml",handleAs:"xml"};
var _b34;
if(_b30==="PUT"){
_b33.putData=this._getPutContent(item);
_b34=dojo.rawXhrPut(_b33);
}else{
if(_b30==="DELETE"){
_b34=dojo.xhrDelete(_b33);
}else{
_b33.postData=this._getPostContent(item);
_b34=dojo.rawXhrPost(_b33);
}
}
_b32=(_b2f.scope||dojo.global);
var self=this;
_b34.addCallback(function(data){
self._forgetItem(item);
if(_b2f.onComplete){
_b2f.onComplete.call(_b32);
}
});
_b34.addErrback(function(_b37){
if(_b2f.onError){
_b2f.onError.call(_b32,_b37);
}
});
},_getPostUrl:function(item){
return this.url;
},_getPutUrl:function(item){
return this.url;
},_getDeleteUrl:function(item){
var url=this.url;
if(item&&this.keyAttribute!==""){
var _b3c=this.getValue(item,this.keyAttribute);
if(_b3c){
var key=this.keyAttribute.charAt(0)==="@"?this.keyAttribute.substring(1):this.keyAttribute;
url+=url.indexOf("?")<0?"?":"&";
url+=key+"="+_b3c;
}
}
return url;
},_getPostContent:function(item){
var _b3f=item.element;
var _b40="<?xml version=\"1.0\"?>";
return _b40+dojox.xml.parser.innerXML(_b3f);
},_getPutContent:function(item){
var _b42=item.element;
var _b43="<?xml version=\"1.0\"?>";
return _b43+dojox.xml.parser.innerXML(_b42);
},_getAttribute:function(_b44,_b45){
if(this._attributeMap){
var key=_b44+"."+_b45;
var _b47=this._attributeMap[key];
if(_b47){
_b45=_b47;
}else{
_b47=this._attributeMap[_b45];
if(_b47){
_b45=_b47;
}
}
}
return _b45;
},_getItem:function(_b48){
try{
var q=null;
if(this.keyAttribute===""){
q=this._getXPath(_b48);
}
return new dojox.data.XmlItem(_b48,this,q);
}
catch(e){
console.log(e);
}
return null;
},_getItemIndex:function(_b4a,_b4b){
for(var i=0;i<_b4a.length;i++){
if(_b4a[i].element===_b4b){
return i;
}
}
return -1;
},_backupItem:function(item){
var _b4e=this._getRootElement(item.element);
if(this._getItemIndex(this._newItems,_b4e)>=0||this._getItemIndex(this._modifiedItems,_b4e)>=0){
return;
}
if(_b4e!=item.element){
item=this._getItem(_b4e);
}
item._backup=_b4e.cloneNode(true);
this._modifiedItems.push(item);
},_restoreItems:function(_b4f){
dojo.forEach(_b4f,function(item){
if(item._backup){
item.element=item._backup;
item._backup=null;
}
},this);
},_forgetItem:function(item){
var _b52=item.element;
var _b53=this._getItemIndex(this._newItems,_b52);
if(_b53>=0){
this._newItems.splice(_b53,1);
}
_b53=this._getItemIndex(this._deletedItems,_b52);
if(_b53>=0){
this._deletedItems.splice(_b53,1);
}
_b53=this._getItemIndex(this._modifiedItems,_b52);
if(_b53>=0){
this._modifiedItems.splice(_b53,1);
}
},_getDocument:function(_b54){
if(_b54){
return _b54.ownerDocument;
}else{
if(!this._document){
return dojox.xml.parser.parse();
}
}
return null;
},_getRootElement:function(_b55){
while(_b55.parentNode){
_b55=_b55.parentNode;
}
return _b55;
},_getXPath:function(_b56){
var _b57=null;
if(!this.sendQuery){
var node=_b56;
_b57="";
while(node&&node!=_b56.ownerDocument){
var pos=0;
var _b5a=node;
var name=node.nodeName;
while(_b5a){
_b5a=_b5a.previousSibling;
if(_b5a&&_b5a.nodeName===name){
pos++;
}
}
var temp="/"+name+"["+pos+"]";
if(_b57){
_b57=temp+_b57;
}else{
_b57=temp;
}
node=node.parentNode;
}
}
return _b57;
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
},fetchItemByIdentity:function(_b60){
var _b61=null;
var _b62=null;
var self=this;
var url=null;
var _b65=null;
var _b66=null;
if(!self.sendQuery){
_b61=function(data){
if(data){
if(self.keyAttribute!==""){
var _b68={};
_b68.query={};
_b68.query[self.keyAttribute]=_b60.identity;
var _b69=self._getItems(data,_b68);
_b62=_b60.scope||dojo.global;
if(_b69.length===1){
if(_b60.onItem){
_b60.onItem.call(_b62,_b69[0]);
}
}else{
if(_b69.length===0){
if(_b60.onItem){
_b60.onItem.call(_b62,null);
}
}else{
if(_b60.onError){
_b60.onError.call(_b62,new Error("Items array size for identity lookup greater than 1, invalid keyAttribute."));
}
}
}
}else{
var _b6a=_b60.identity.split("/");
var i;
var node=data;
for(i=0;i<_b6a.length;i++){
if(_b6a[i]&&_b6a[i]!==""){
var _b6d=_b6a[i];
_b6d=_b6d.substring(0,_b6d.length-1);
var vals=_b6d.split("[");
var tag=vals[0];
var _b70=parseInt(vals[1],10);
var pos=0;
if(node){
var _b72=node.childNodes;
if(_b72){
var j;
var _b74=null;
for(j=0;j<_b72.length;j++){
var _b75=_b72[j];
if(_b75.nodeName===tag){
if(pos<_b70){
pos++;
}else{
_b74=_b75;
break;
}
}
}
if(_b74){
node=_b74;
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
if(_b60.onItem){
_b62=_b60.scope||dojo.global;
_b60.onItem.call(_b62,item);
}
}
}
};
url=this._getFetchUrl(null);
_b65={url:url,handleAs:"xml",preventCache:true};
_b66=dojo.xhrGet(_b65);
_b66.addCallback(_b61);
if(_b60.onError){
_b66.addErrback(function(_b77){
var s=_b60.scope||dojo.global;
_b60.onError.call(s,_b77);
});
}
}else{
if(self.keyAttribute!==""){
var _b79={query:{}};
_b79.query[self.keyAttribute]=_b60.identity;
url=this._getFetchUrl(_b79);
_b61=function(data){
var item=null;
if(data){
var _b7c=self._getItems(_b7c,{});
if(_b7c.length===1){
item=_b7c[0];
}else{
if(_b60.onError){
var _b7d=_b60.scope||dojo.global;
_b60.onError.call(_b7d,new Error("More than one item was returned from the server for the denoted identity"));
}
}
}
if(_b60.onItem){
_b7d=_b60.scope||dojo.global;
_b60.onItem.call(_b7d,item);
}
};
_b65={url:url,handleAs:"xml",preventCache:true};
_b66=dojo.xhrGet(_b65);
_b66.addCallback(_b61);
if(_b60.onError){
_b66.addErrback(function(_b7e){
var s=_b60.scope||dojo.global;
_b60.onError.call(s,_b7e);
});
}
}else{
if(_b60.onError){
var s=_b60.scope||dojo.global;
_b60.onError.call(s,new Error("XmlStore is not told that the server to provides identity support.  No keyAttribute specified."));
}
}
}
}});
dojo.declare("dojox.data.XmlItem",null,{constructor:function(_b81,_b82,_b83){
this.element=_b81;
this.store=_b82;
this.q=_b83;
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
var _b88={};
m._degToRad=function(_b89){
return _b88[_b89]||(_b88[_b89]=(Math.PI*_b89/180));
};
m._radToDeg=function(_b8a){
return _b8a/Math.PI*180;
};
m.Matrix2D=function(arg){
if(arg){
if(typeof arg=="number"){
this.xx=this.yy=arg;
}else{
if(arg instanceof Array){
if(arg.length>0){
var _b8c=m.normalize(arg[0]);
for(var i=1;i<arg.length;++i){
var l=_b8c,r=dojox.gfx.matrix.normalize(arg[i]);
_b8c=new m.Matrix2D();
_b8c.xx=l.xx*r.xx+l.xy*r.yx;
_b8c.xy=l.xx*r.xy+l.xy*r.yy;
_b8c.yx=l.yx*r.xx+l.yy*r.yx;
_b8c.yy=l.yx*r.xy+l.yy*r.yy;
_b8c.dx=l.xx*r.dx+l.xy*r.dy+l.dx;
_b8c.dy=l.yx*r.dx+l.yy*r.dy+l.dy;
}
dojo.mixin(this,_b8c);
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
},rotate:function(_b94){
var c=Math.cos(_b94);
var s=Math.sin(_b94);
return new m.Matrix2D({xx:c,xy:-s,yx:s,yy:c});
},rotateg:function(_b97){
return m.rotate(m._degToRad(_b97));
},skewX:function(_b98){
return new m.Matrix2D({xy:Math.tan(_b98)});
},skewXg:function(_b99){
return m.skewX(m._degToRad(_b99));
},skewY:function(_b9a){
return new m.Matrix2D({yx:Math.tan(_b9a)});
},skewYg:function(_b9b){
return m.skewY(m._degToRad(_b9b));
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
},normalize:function(_ba8){
return (_ba8 instanceof m.Matrix2D)?_ba8:new m.Matrix2D(_ba8);
},clone:function(_ba9){
var obj=new m.Matrix2D();
for(var i in _ba9){
if(typeof (_ba9[i])=="number"&&typeof (obj[i])=="number"&&obj[i]!=_ba9[i]){
obj[i]=_ba9[i];
}
}
return obj;
},invert:function(_bac){
var M=m.normalize(_bac),D=M.xx*M.yy-M.xy*M.yx,M=new m.Matrix2D({xx:M.yy/D,xy:-M.xy/D,yx:-M.yx/D,yy:M.xx/D,dx:(M.xy*M.dy-M.yy*M.dx)/D,dy:(M.yx*M.dx-M.xx*M.dy)/D});
return M;
},_multiplyPoint:function(_baf,x,y){
return {x:_baf.xx*x+_baf.xy*y+_baf.dx,y:_baf.yx*x+_baf.yy*y+_baf.dy};
},multiplyPoint:function(_bb2,a,b){
var M=m.normalize(_bb2);
if(typeof a=="number"&&typeof b=="number"){
return m._multiplyPoint(M,a,b);
}
return m._multiplyPoint(M,a.x,a.y);
},multiply:function(_bb6){
var M=m.normalize(_bb6);
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
},_sandwich:function(_bbb,x,y){
return m.multiply(m.translate(x,y),_bbb,m.translate(-x,-y));
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
},rotateAt:function(_bc2,a,b){
if(arguments.length>2){
return m._sandwich(m.rotate(_bc2),a,b);
}
return m._sandwich(m.rotate(_bc2),a.x,a.y);
},rotategAt:function(_bc5,a,b){
if(arguments.length>2){
return m._sandwich(m.rotateg(_bc5),a,b);
}
return m._sandwich(m.rotateg(_bc5),a.x,a.y);
},skewXAt:function(_bc8,a,b){
if(arguments.length>2){
return m._sandwich(m.skewX(_bc8),a,b);
}
return m._sandwich(m.skewX(_bc8),a.x,a.y);
},skewXgAt:function(_bcb,a,b){
if(arguments.length>2){
return m._sandwich(m.skewXg(_bcb),a,b);
}
return m._sandwich(m.skewXg(_bcb),a.x,a.y);
},skewYAt:function(_bce,a,b){
if(arguments.length>2){
return m._sandwich(m.skewY(_bce),a,b);
}
return m._sandwich(m.skewY(_bce),a.x,a.y);
},skewYgAt:function(_bd1,a,b){
if(arguments.length>2){
return m._sandwich(m.skewYg(_bd1),a,b);
}
return m._sandwich(m.skewYg(_bd1),a.x,a.y);
}});
})();
dojox.gfx.Matrix2D=dojox.gfx.matrix.Matrix2D;
}
if(!dojo._hasResource["dojox.gfx._base"]){
dojo._hasResource["dojox.gfx._base"]=true;
dojo.provide("dojox.gfx._base");
(function(){
var g=dojox.gfx,b=g._base;
g._hasClass=function(node,_bd7){
var cls=node.getAttribute("className");
return cls&&(" "+cls+" ").indexOf(" "+_bd7+" ")>=0;
};
g._addClass=function(node,_bda){
var cls=node.getAttribute("className")||"";
if(!cls||(" "+cls+" ").indexOf(" "+_bda+" ")<0){
node.setAttribute("className",cls+(cls?" ":"")+_bda);
}
};
g._removeClass=function(node,_bdd){
var cls=node.getAttribute("className");
if(cls){
node.setAttribute("className",cls.replace(new RegExp("(^|\\s+)"+_bdd+"(\\s+|$)"),"$1$2"));
}
};
b._getFontMeasurements=function(){
var _bdf={"1em":0,"1ex":0,"100%":0,"12pt":0,"16px":0,"xx-small":0,"x-small":0,"small":0,"medium":0,"large":0,"x-large":0,"xx-large":0};
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
for(var p in _bdf){
div.style.fontSize=p;
_bdf[p]=Math.round(div.offsetHeight*12/16)*16/12/1000;
}
dojo.body().removeChild(div);
div=null;
return _bdf;
};
var _be3=null;
b._getCachedFontMeasurements=function(_be4){
if(_be4||!_be3){
_be3=b._getFontMeasurements();
}
return _be3;
};
var _be5=null,_be6={};
b._getTextBox=function(text,_be8,_be9){
var m,s;
if(!_be5){
m=_be5=dojo.doc.createElement("div");
s=m.style;
s.position="absolute";
s.left="-10000px";
s.top="0";
dojo.body().appendChild(m);
}else{
m=_be5;
s=m.style;
}
m.className="";
s.border="0";
s.margin="0";
s.padding="0";
s.outline="0";
if(arguments.length>1&&_be8){
for(var i in _be8){
if(i in _be6){
continue;
}
s[i]=_be8[i];
}
}
if(arguments.length>2&&_be9){
m.className=_be9;
}
m.innerHTML=text;
return dojo.marginBox(m);
};
var _bed=0;
b._getUniqueId=function(){
var id;
do{
id=dojo._scopeName+"Unique"+(++_bed);
}while(dojo.byId(id));
return id;
};
})();
dojo.mixin(dojox.gfx,{defaultPath:{type:"path",path:""},defaultPolyline:{type:"polyline",points:[]},defaultRect:{type:"rect",x:0,y:0,width:100,height:100,r:0},defaultEllipse:{type:"ellipse",cx:0,cy:0,rx:200,ry:100},defaultCircle:{type:"circle",cx:0,cy:0,r:100},defaultLine:{type:"line",x1:0,y1:0,x2:100,y2:100},defaultImage:{type:"image",x:0,y:0,width:0,height:0,src:""},defaultText:{type:"text",x:0,y:0,text:"",align:"start",decoration:"none",rotated:false,kerning:true},defaultTextPath:{type:"textpath",text:"",align:"start",decoration:"none",rotated:false,kerning:true},defaultStroke:{type:"stroke",color:"black",style:"solid",width:1,cap:"butt",join:4},defaultLinearGradient:{type:"linear",x1:0,y1:0,x2:100,y2:100,colors:[{offset:0,color:"black"},{offset:1,color:"white"}]},defaultRadialGradient:{type:"radial",cx:0,cy:0,r:100,colors:[{offset:0,color:"black"},{offset:1,color:"white"}]},defaultPattern:{type:"pattern",x:0,y:0,width:0,height:0,src:""},defaultFont:{type:"font",style:"normal",variant:"normal",weight:"normal",size:"10pt",family:"serif"},getDefault:(function(){
var _bef={};
return function(type){
var t=_bef[type];
if(t){
return new t();
}
t=_bef[type]=function(){
};
t.prototype=dojox.gfx["default"+type];
return new t();
};
})(),normalizeColor:function(_bf2){
return (_bf2 instanceof dojo.Color)?_bf2:new dojo.Color(_bf2);
},normalizeParameters:function(_bf3,_bf4){
if(_bf4){
var _bf5={};
for(var x in _bf3){
if(x in _bf4&&!(x in _bf5)){
_bf3[x]=_bf4[x];
}
}
}
return _bf3;
},makeParameters:function(_bf7,_bf8){
if(!_bf8){
return dojo.delegate(_bf7);
}
var _bf9={};
for(var i in _bf7){
if(!(i in _bf9)){
_bf9[i]=dojo.clone((i in _bf8)?_bf8[i]:_bf7[i]);
}
}
return _bf9;
},formatNumber:function(x,_bfc){
var val=x.toString();
if(val.indexOf("e")>=0){
val=x.toFixed(4);
}else{
var _bfe=val.indexOf(".");
if(_bfe>=0&&val.length-_bfe>5){
val=x.toFixed(4);
}
}
if(x<0){
return val;
}
return _bfc?" "+val:val;
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
var _c08=dojox.gfx.px_in_pt();
var val=parseFloat(len);
switch(len.slice(-2)){
case "px":
return val;
case "pt":
return val*_c08;
case "in":
return val*72*_c08;
case "pc":
return val*12*_c08;
case "mm":
return val*dojox.gfx.mm_in_pt*_c08;
case "cm":
return val*dojox.gfx.cm_in_pt*_c08;
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
var gfx=dojo.getObject("dojox.gfx",true),sl,flag,_c0f;
if(!gfx.renderer){
var _c10=(typeof dojo.config.gfxRenderer=="string"?dojo.config.gfxRenderer:"svg,vml,silverlight,canvas").split(",");
var ua=navigator.userAgent,_c12=0,_c13=0;
if(dojo.isSafari>=3){
if(ua.indexOf("iPhone")>=0||ua.indexOf("iPod")>=0){
_c0f=ua.match(/Version\/(\d(\.\d)?(\.\d)?)\sMobile\/([^\s]*)\s?/);
if(_c0f){
_c12=parseInt(_c0f[4].substr(0,3),16);
}
}
}
if(dojo.isWebKit){
if(!_c12){
_c0f=ua.match(/Android\s+(\d+\.\d+)/);
if(_c0f){
_c13=parseFloat(_c0f[1]);
}
}
}
for(var i=0;i<_c10.length;++i){
switch(_c10[i]){
case "svg":
if(!dojo.isIE&&(!_c12||_c12>=1521)&&!_c13&&!dojo.isAIR){
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
var _c16={"1em":0,"1ex":0,"100%":0,"12pt":0,"16px":0,"xx-small":0,"x-small":0,"small":0,"medium":0,"large":0,"x-large":0,"xx-large":0};
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
for(var p in _c16){
ds.fontSize=p;
_c16[p]=Math.round(div.offsetHeight*12/16)*16/12/1000;
}
dojo.body().removeChild(div);
div=null;
return _c16;
};
var _c1a=null;
dhm.getCachedFontMeasurements=function(_c1b){
if(_c1b||!_c1a){
_c1a=dhm.getFontMeasurements();
}
return _c1a;
};
var _c1c=null,_c1d={};
dhm.getTextBox=function(text,_c1f,_c20){
var m;
if(!_c1c){
m=_c1c=dojo.doc.createElement("div");
m.style.position="absolute";
m.style.left="-10000px";
m.style.top="0";
dojo.body().appendChild(m);
}else{
m=_c1c;
}
m.className="";
m.style.border="0";
m.style.margin="0";
m.style.padding="0";
m.style.outline="0";
if(arguments.length>1&&_c1f){
for(var i in _c1f){
if(i in _c1d){
continue;
}
m.style[i]=_c1f[i];
}
}
if(arguments.length>2&&_c20){
m.className=_c20;
}
m.innerHTML=text;
return dojo.marginBox(m);
};
var _c23={w:16,h:16};
dhm.getScrollbar=function(){
return {w:_c23.w,h:_c23.h};
};
dhm._fontResizeNode=null;
dhm.initOnFontResize=function(_c24){
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
_c23.w=n.offsetWidth-n.clientWidth;
_c23.h=n.offsetHeight-n.clientHeight;
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
dgu.setStyleHeightPx=function(_c2e,_c2f){
if(_c2f>=0){
var s=_c2e.style;
var v=_c2f+"px";
if(_c2e&&s["height"]!=v){
s["height"]=v;
}
}
};
dgu.mouseEvents=["mouseover","mouseout","mousedown","mouseup","click","dblclick","contextmenu"];
dgu.keyEvents=["keyup","keydown","keypress"];
dgu.funnelEvents=function(_c32,_c33,_c34,_c35){
var evts=(_c35?_c35:dgu.mouseEvents.concat(dgu.keyEvents));
for(var i=0,l=evts.length;i<l;i++){
_c33.connect(_c32,"on"+evts[i],_c34);
}
},dgu.removeNode=function(_c39){
_c39=dojo.byId(_c39);
_c39&&_c39.parentNode&&_c39.parentNode.removeChild(_c39);
return _c39;
};
dgu.arrayCompare=function(inA,inB){
for(var i=0,l=inA.length;i<l;i++){
if(inA[i]!=inB[i]){
return false;
}
}
return (inA.length==inB.length);
};
dgu.arrayInsert=function(_c3e,_c3f,_c40){
if(_c3e.length<=_c3f){
_c3e[_c3f]=_c40;
}else{
_c3e.splice(_c3f,0,_c40);
}
};
dgu.arrayRemove=function(_c41,_c42){
_c41.splice(_c42,1);
};
dgu.arraySwap=function(_c43,inI,inJ){
var _c46=_c43[inI];
_c43[inI]=_c43[inJ];
_c43[inJ]=_c46;
};
})();
}
if(!dojo._hasResource["dojox.grid._Scroller"]){
dojo._hasResource["dojox.grid._Scroller"]=true;
dojo.provide("dojox.grid._Scroller");
(function(){
var _c47=function(_c48){
var i=0,n,p=_c48.parentNode;
while((n=p.childNodes[i++])){
if(n==_c48){
return i-1;
}
}
return -1;
};
var _c4c=function(_c4d){
if(!_c4d){
return;
}
var _c4e=function(inW){
return inW.domNode&&dojo.isDescendant(inW.domNode,_c4d,true);
};
var ws=dijit.registry.filter(_c4e);
for(var i=0,w;(w=ws[i]);i++){
w.destroy();
}
delete ws;
};
var _c53=function(_c54){
var node=dojo.byId(_c54);
return (node&&node.tagName?node.tagName.toLowerCase():"");
};
var _c56=function(_c57,_c58){
var _c59=[];
var i=0,n;
while((n=_c57.childNodes[i++])){
if(_c53(n)==_c58){
_c59.push(n);
}
}
return _c59;
};
var _c5c=function(_c5d){
return _c56(_c5d,"div");
};
dojo.declare("dojox.grid._Scroller",null,{constructor:function(_c5e){
this.setContentNodes(_c5e);
this.pageHeights=[];
this.pageNodes=[];
this.stack=[];
},rowCount:0,defaultRowHeight:32,keepRows:100,contentNode:null,scrollboxNode:null,defaultPageHeight:0,keepPages:10,pageCount:0,windowHeight:0,firstVisibleRow:0,lastVisibleRow:0,averageRowHeight:0,page:0,pageTop:0,init:function(_c5f,_c60,_c61){
switch(arguments.length){
case 3:
this.rowsPerPage=_c61;
case 2:
this.keepRows=_c60;
case 1:
this.rowCount=_c5f;
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
},_getPageCount:function(_c62,_c63){
return _c62?(Math.ceil(_c62/_c63)||1):0;
},destroy:function(){
this.invalidateNodes();
delete this.contentNodes;
delete this.contentNode;
delete this.scrollboxNode;
},setKeepInfo:function(_c64){
this.keepRows=_c64;
this.keepPages=!this.keepRows?this.keepRows:Math.max(Math.ceil(this.keepRows/this.rowsPerPage),2);
},setContentNodes:function(_c65){
this.contentNodes=_c65;
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
},updateRowCount:function(_c67){
this.invalidateNodes();
this.rowCount=_c67;
var _c68=this.pageCount;
if(_c68===0){
this.height=1;
}
this.pageCount=this._getPageCount(this.rowCount,this.rowsPerPage);
if(this.pageCount<_c68){
for(var i=_c68-1;i>=this.pageCount;i--){
this.height-=this.getPageHeight(i);
delete this.pageHeights[i];
}
}else{
if(this.pageCount>_c68){
this.height+=this.defaultPageHeight*(this.pageCount-_c68-1)+this.calcLastPageHeight();
}
}
this.resize();
},pageExists:function(_c6a){
return Boolean(this.getDefaultPageNode(_c6a));
},measurePage:function(_c6b){
var n=this.getDefaultPageNode(_c6b);
return (n&&n.innerHTML)?n.offsetHeight:0;
},positionPage:function(_c6d,_c6e){
for(var i=0;i<this.colCount;i++){
this.pageNodes[i][_c6d].style.top=_c6e+"px";
}
},repositionPages:function(_c70){
var _c71=this.getDefaultNodes();
var last=0;
for(var i=0;i<this.stack.length;i++){
last=Math.max(this.stack[i],last);
}
var n=_c71[_c70];
var y=(n?this.getPageNodePosition(n)+this.getPageHeight(_c70):0);
for(var p=_c70+1;p<=last;p++){
n=_c71[p];
if(n){
if(this.getPageNodePosition(n)==y){
return;
}
this.positionPage(p,y);
}
y+=this.getPageHeight(p);
}
},installPage:function(_c77){
for(var i=0;i<this.colCount;i++){
this.contentNodes[i].appendChild(this.pageNodes[i][_c77]);
}
},preparePage:function(_c79,_c7a){
var p=(_c7a?this.popPage():null);
for(var i=0;i<this.colCount;i++){
var _c7d=this.pageNodes[i];
var _c7e=(p===null?this.createPageNode():this.invalidatePageNode(p,_c7d));
_c7e.pageIndex=_c79;
_c7e.id=(this._pageIdPrefix||"")+"page-"+_c79;
_c7d[_c79]=_c7e;
}
},renderPage:function(_c7f){
var _c80=[];
for(var i=0;i<this.colCount;i++){
_c80[i]=this.pageNodes[i][_c7f];
}
for(var i=0,j=_c7f*this.rowsPerPage;(i<this.rowsPerPage)&&(j<this.rowCount);i++,j++){
this.renderRow(j,_c80);
}
},removePage:function(_c83){
for(var i=0,j=_c83*this.rowsPerPage;i<this.rowsPerPage;i++,j++){
this.removeRow(j);
}
},destroyPage:function(_c86){
for(var i=0;i<this.colCount;i++){
var n=this.invalidatePageNode(_c86,this.pageNodes[i]);
if(n){
dojo.destroy(n);
}
}
},pacify:function(_c89){
},pacifying:false,pacifyTicks:200,setPacifying:function(_c8a){
if(this.pacifying!=_c8a){
this.pacifying=_c8a;
this.pacify(this.pacifying);
}
},startPacify:function(){
this.startPacifyTicks=new Date().getTime();
},doPacify:function(){
var _c8b=(new Date().getTime()-this.startPacifyTicks)>this.pacifyTicks;
this.setPacifying(true);
this.startPacify();
return _c8b;
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
var _c8d=(this.page<this.pageCount-1)?this.rowsPerPage:((this.rowCount%this.rowsPerPage)||this.rowsPerPage);
var _c8e=this.getPageHeight(this.page);
this.averageRowHeight=(_c8e>0&&_c8d>0)?(_c8e/_c8d):0;
},calcLastPageHeight:function(){
if(!this.pageCount){
return 0;
}
var _c8f=this.pageCount-1;
var _c90=((this.rowCount%this.rowsPerPage)||(this.rowsPerPage))*this.defaultRowHeight;
this.pageHeights[_c8f]=_c90;
return _c90;
},updateContentHeight:function(inDh){
this.height+=inDh;
this.resize();
},updatePageHeight:function(_c92){
if(this.pageExists(_c92)){
var oh=this.getPageHeight(_c92);
var h=(this.measurePage(_c92))||(oh);
this.pageHeights[_c92]=h;
if((h)&&(oh!=h)){
this.updateContentHeight(h-oh);
this.repositionPages(_c92);
}
}
},rowHeightChanged:function(_c95){
this.updatePageHeight(Math.floor(_c95/this.rowsPerPage));
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
},getPageHeight:function(_c97){
var ph=this.pageHeights[_c97];
return (ph!==undefined?ph:this.defaultPageHeight);
},pushPage:function(_c99){
return this.stack.push(_c99);
},popPage:function(){
return this.stack.shift();
},findPage:function(_c9a){
var i=0,h=0;
for(var ph=0;i<this.pageCount;i++,h+=ph){
ph=this.getPageHeight(i);
if(h+ph>=_c9a){
break;
}
}
this.page=i;
this.pageTop=h;
},buildPage:function(_c9e,_c9f,_ca0){
this.preparePage(_c9e,_c9f);
this.positionPage(_c9e,_ca0);
this.installPage(_c9e);
this.renderPage(_c9e);
this.pushPage(_c9e);
},needPage:function(_ca1,_ca2){
var h=this.getPageHeight(_ca1),oh=h;
if(!this.pageExists(_ca1)){
this.buildPage(_ca1,this.keepPages&&(this.stack.length>=this.keepPages),_ca2);
h=this.measurePage(_ca1)||h;
this.pageHeights[_ca1]=h;
if(h&&(oh!=h)){
this.updateContentHeight(h-oh);
}
}else{
this.positionPage(_ca1,_ca2);
}
return h;
},onscroll:function(){
this.scroll(this.scrollboxNode.scrollTop);
},scroll:function(_ca5){
this.grid.scrollTop=_ca5;
if(this.colCount){
this.startPacify();
this.findPage(_ca5);
var h=this.height;
var b=this.getScrollBottom(_ca5);
for(var p=this.page,y=this.pageTop;(p<this.pageCount)&&((b<0)||(y<b));p++){
y+=this.needPage(p,y);
}
this.firstVisibleRow=this.getFirstVisibleRow(this.page,this.pageTop,_ca5);
this.lastVisibleRow=this.getLastVisibleRow(p-1,y,b);
if(h!=this.height){
this.repositionPages(p-1);
}
this.endPacify();
}
},getScrollBottom:function(_caa){
return (this.windowHeight>=0?_caa+this.windowHeight:-1);
},processNodeEvent:function(e,_cac){
var t=e.target;
while(t&&(t!=_cac)&&t.parentNode&&(t.parentNode.parentNode!=_cac)){
t=t.parentNode;
}
if(!t||!t.parentNode||(t.parentNode.parentNode!=_cac)){
return false;
}
var page=t.parentNode;
e.topRowIndex=page.pageIndex*this.rowsPerPage;
e.rowIndex=e.topRowIndex+_c47(t);
e.rowTarget=t;
return true;
},processEvent:function(e){
return this.processNodeEvent(e,this.contentNode);
},renderRow:function(_cb0,_cb1){
},removeRow:function(_cb2){
},getDefaultPageNode:function(_cb3){
return this.getDefaultNodes()[_cb3];
},positionPageNode:function(_cb4,_cb5){
},getPageNodePosition:function(_cb6){
return _cb6.offsetTop;
},invalidatePageNode:function(_cb7,_cb8){
var p=_cb8[_cb7];
if(p){
delete _cb8[_cb7];
this.removePage(_cb7,p);
_c4c(p);
p.innerHTML="";
}
return p;
},getPageRow:function(_cba){
return _cba*this.rowsPerPage;
},getLastPageRow:function(_cbb){
return Math.min(this.rowCount,this.getPageRow(_cbb+1))-1;
},getFirstVisibleRow:function(_cbc,_cbd,_cbe){
if(!this.pageExists(_cbc)){
return 0;
}
var row=this.getPageRow(_cbc);
var _cc0=this.getDefaultNodes();
var rows=_c5c(_cc0[_cbc]);
for(var i=0,l=rows.length;i<l&&_cbd<_cbe;i++,row++){
_cbd+=rows[i].offsetHeight;
}
return (row?row-1:row);
},getLastVisibleRow:function(_cc4,_cc5,_cc6){
if(!this.pageExists(_cc4)){
return 0;
}
var _cc7=this.getDefaultNodes();
var row=this.getLastPageRow(_cc4);
var rows=_c5c(_cc7[_cc4]);
for(var i=rows.length-1;i>=0&&_cc5>_cc6;i--,row--){
_cc5-=rows[i].offsetHeight;
}
return row+1;
},findTopRow:function(_ccb){
var _ccc=this.getDefaultNodes();
var rows=_c5c(_ccc[this.page]);
for(var i=0,l=rows.length,t=this.pageTop,h;i<l;i++){
h=rows[i].offsetHeight;
t+=h;
if(t>=_ccb){
this.offset=h-(t-_ccb);
return i+this.page*this.rowsPerPage;
}
}
return -1;
},findScrollTop:function(_cd2){
var _cd3=Math.floor(_cd2/this.rowsPerPage);
var t=0;
for(var i=0;i<_cd3;i++){
t+=this.getPageHeight(i);
}
this.pageTop=t;
this.needPage(_cd3,this.pageTop);
var _cd6=this.getDefaultNodes();
var rows=_c5c(_cd6[_cd3]);
var r=_cd2-this.rowsPerPage*_cd3;
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
var _cda=function(_cdb){
try{
dojox.grid.util.fire(_cdb,"focus");
dojox.grid.util.fire(_cdb,"select");
}
catch(e){
}
};
var _cdc=function(){
setTimeout(dojo.hitch.apply(dojo,arguments),0);
};
var dgc=dojox.grid.cells;
dojo.declare("dojox.grid.cells._Base",null,{styles:"",classes:"",editable:false,alwaysEditing:false,formatter:null,defaultValue:"...",value:null,hidden:false,noresize:false,_valueProp:"value",_formatPending:false,constructor:function(_cde){
this._props=_cde||{};
dojo.mixin(this,_cde);
},format:function(_cdf,_ce0){
var f,i=this.grid.edit.info,d=this.get?this.get(_cdf,_ce0):(this.value||this.defaultValue);
//d=(d&&d.replace)?d.replace(/</g,"&lt;"):d;
// ^^^ See http://trac.atomiclabs.com/ticket/769.
if(this.editable&&(this.alwaysEditing||(i.rowIndex==_cdf&&i.cell==this))){
return this.formatEditing(d,_cdf);
}else{
var v=(d!=this.defaultValue&&(f=this.formatter))?f.call(this,d,_cdf):d;
return (typeof v=="undefined"?this.defaultValue:v);
}
},formatEditing:function(_ce5,_ce6){
},getNode:function(_ce7){
return this.view.getCellNode(_ce7,this.index);
},getHeaderNode:function(){
return this.view.getHeaderCellNode(this.index);
},getEditNode:function(_ce8){
return (this.getNode(_ce8)||0).firstChild||0;
},canResize:function(){
var uw=this.unitWidth;
return uw&&(uw!=="auto");
},isFlex:function(){
var uw=this.unitWidth;
return uw&&dojo.isString(uw)&&(uw=="auto"||uw.slice(-1)=="%");
},applyEdit:function(_ceb,_cec){
this.grid.edit.applyCellEdit(_ceb,this,_cec);
},cancelEdit:function(_ced){
this.grid.doCancelEdit(_ced);
},_onEditBlur:function(_cee){
if(this.grid.edit.isEditCell(_cee,this.index)){
this.grid.edit.apply();
}
},registerOnBlur:function(_cef,_cf0){
if(this.commitOnBlur){
dojo.connect(_cef,"onblur",function(e){
setTimeout(dojo.hitch(this,"_onEditBlur",_cf0),250);
});
}
},needFormatNode:function(_cf2,_cf3){
this._formatPending=true;
_cdc(this,"_formatNode",_cf2,_cf3);
},cancelFormatNode:function(){
this._formatPending=false;
},_formatNode:function(_cf4,_cf5){
if(this._formatPending){
this._formatPending=false;
dojo.setSelectable(this.grid.domNode,true);
this.formatNode(this.getEditNode(_cf5),_cf4,_cf5);
}
},formatNode:function(_cf6,_cf7,_cf8){
if(dojo.isIE){
_cdc(this,"focus",_cf8,_cf6);
}else{
this.focus(_cf8,_cf6);
}
},dispatchEvent:function(m,e){
if(m in this){
return this[m](e);
}
},getValue:function(_cfb){
return this.getEditNode(_cfb)[this._valueProp];
},setValue:function(_cfc,_cfd){
var n=this.getEditNode(_cfc);
if(n){
n[this._valueProp]=_cfd;
}
},focus:function(_cff,_d00){
_cda(_d00||this.getEditNode(_cff));
},save:function(_d01){
this.value=this.value||this.getValue(_d01);
},restore:function(_d02){
this.setValue(_d02,this.value);
},_finish:function(_d03){
dojo.setSelectable(this.grid.domNode,false);
this.cancelFormatNode();
},apply:function(_d04){
this.applyEdit(this.getValue(_d04),_d04);
this._finish(_d04);
},cancel:function(_d05){
this.cancelEdit(_d05);
this._finish(_d05);
}});
dgc._Base.markupFactory=function(node,_d07){
var d=dojo;
var _d09=d.trim(d.attr(node,"formatter")||"");
if(_d09){
_d07.formatter=dojo.getObject(_d09);
}
var get=d.trim(d.attr(node,"get")||"");
if(get){
_d07.get=dojo.getObject(get);
}
var _d0b=function(attr){
var _d0d=d.trim(d.attr(node,attr)||"");
return _d0d?!(_d0d.toLowerCase()=="false"):undefined;
};
_d07.sortDesc=_d0b("sortDesc");
_d07.editable=_d0b("editable");
_d07.alwaysEditing=_d0b("alwaysEditing");
_d07.noresize=_d0b("noresize");
var _d0e=d.trim(d.attr(node,"loadingText")||d.attr(node,"defaultValue")||"");
if(_d0e){
_d07.defaultValue=_d0e;
}
var _d0f=function(attr){
return d.trim(d.attr(node,attr)||"")||undefined;
};
_d07.styles=_d0f("styles");
_d07.headerStyles=_d0f("headerStyles");
_d07.cellStyles=_d0f("cellStyles");
_d07.classes=_d0f("classes");
_d07.headerClasses=_d0f("headerClasses");
_d07.cellClasses=_d0f("cellClasses");
};
dojo.declare("dojox.grid.cells.Cell",dgc._Base,{constructor:function(){
this.keyFilter=this.keyFilter;
},keyFilter:null,formatEditing:function(_d11,_d12){
this.needFormatNode(_d11,_d12);
return "<input class=\"dojoxGridInput\" type=\"text\" value=\""+_d11+"\">";
},formatNode:function(_d13,_d14,_d15){
this.inherited(arguments);
this.registerOnBlur(_d13,_d15);
},doKey:function(e){
if(this.keyFilter){
var key=String.fromCharCode(e.charCode);
if(key.search(this.keyFilter)==-1){
dojo.stopEvent(e);
}
}
},_finish:function(_d18){
this.inherited(arguments);
var n=this.getEditNode(_d18);
try{
dojox.grid.util.fire(n,"blur");
}
catch(e){
}
}});
dgc.Cell.markupFactory=function(node,_d1b){
dgc._Base.markupFactory(node,_d1b);
var d=dojo;
var _d1d=d.trim(d.attr(node,"keyFilter")||"");
if(_d1d){
_d1b.keyFilter=new RegExp(_d1d);
}
};
dojo.declare("dojox.grid.cells.RowIndex",dgc.Cell,{name:"Row",postscript:function(){
this.editable=false;
},get:function(_d1e){
return _d1e+1;
}});
dgc.RowIndex.markupFactory=function(node,_d20){
dgc.Cell.markupFactory(node,_d20);
};
dojo.declare("dojox.grid.cells.Select",dgc.Cell,{options:null,values:null,returnIndex:-1,constructor:function(_d21){
this.values=this.values||this.options;
},formatEditing:function(_d22,_d23){
this.needFormatNode(_d22,_d23);
var h=["<select class=\"dojoxGridSelect\">"];
for(var i=0,o,v;((o=this.options[i])!==undefined)&&((v=this.values[i])!==undefined);i++){
h.push("<option",(_d22==v?" selected":"")," value=\""+v+"\"",">",o,"</option>");
}
h.push("</select>");
return h.join("");
},getValue:function(_d28){
var n=this.getEditNode(_d28);
if(n){
var i=n.selectedIndex,o=n.options[i];
return this.returnIndex>-1?i:o.value||o.innerHTML;
}
}});
dgc.Select.markupFactory=function(node,cell){
dgc.Cell.markupFactory(node,cell);
var d=dojo;
var _d2f=d.trim(d.attr(node,"options")||"");
if(_d2f){
var o=_d2f.split(",");
if(o[0]!=_d2f){
cell.options=o;
}
}
var _d31=d.trim(d.attr(node,"values")||"");
if(_d31){
var v=_d31.split(",");
if(v[0]!=_d31){
cell.values=v;
}
}
};
dojo.declare("dojox.grid.cells.AlwaysEdit",dgc.Cell,{alwaysEditing:true,_formatNode:function(_d33,_d34){
this.formatNode(this.getEditNode(_d34),_d33,_d34);
},applyStaticValue:function(_d35){
var e=this.grid.edit;
e.applyCellEdit(this.getValue(_d35),this,_d35);
e.start(this,_d35,true);
}});
dgc.AlwaysEdit.markupFactory=function(node,cell){
dgc.Cell.markupFactory(node,cell);
};
dojo.declare("dojox.grid.cells.Bool",dgc.AlwaysEdit,{_valueProp:"checked",formatEditing:function(_d39,_d3a){
return "<input class=\"dojoxGridInput\" type=\"checkbox\""+(_d39?" checked=\"checked\"":"")+" style=\"width: auto\" />";
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
var _d3f=function(td){
return td.cellIndex>=0?td.cellIndex:dojo.indexOf(td.parentNode.cells,td);
};
var _d41=function(tr){
return tr.rowIndex>=0?tr.rowIndex:dojo.indexOf(tr.parentNode.childNodes,tr);
};
var _d43=function(_d44,_d45){
return _d44&&((_d44.rows||0)[_d45]||_d44.childNodes[_d45]);
};
var _d46=function(node){
for(var n=node;n&&n.tagName!="TABLE";n=n.parentNode){
}
return n;
};
var _d49=function(_d4a,_d4b){
for(var n=_d4a;n&&_d4b(n);n=n.parentNode){
}
return n;
};
var _d4d=function(_d4e){
var name=_d4e.toUpperCase();
return function(node){
return node.tagName!=name;
};
};
var _d51=dojox.grid.util.rowIndexTag;
var _d52=dojox.grid.util.gridViewTag;
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
},generateCellMarkup:function(_d55,_d56,_d57,_d58){
var _d59=[],html;
var _d5b=dojo.isFF<3?"wairole:":"";
if(_d58){
var _d5c=_d55.index!=_d55.grid.getSortIndex()?"":_d55.grid.sortInfo>0?"aria-sort=\"ascending\"":"aria-sort=\"descending\"";
html=["<th tabIndex=\"-1\" role=\"",_d5b,"columnheader\"",_d5c];
}else{
html=["<td tabIndex=\"-1\" role=\"",_d5b,"gridcell\""];
}
_d55.colSpan&&html.push(" colspan=\"",_d55.colSpan,"\"");
_d55.rowSpan&&html.push(" rowspan=\"",_d55.rowSpan,"\"");
html.push(" class=\"dojoxGridCell ");
_d55.classes&&html.push(_d55.classes," ");
_d57&&html.push(_d57," ");
_d59.push(html.join(""));
_d59.push("");
html=["\" idx=\"",_d55.index,"\" style=\""];
if(_d56&&_d56[_d56.length-1]!=";"){
_d56+=";";
}
html.push(_d55.styles,_d56||"",_d55.hidden?"display:none;":"");
_d55.unitWidth&&html.push("width:",_d55.unitWidth,";");
_d59.push(html.join(""));
_d59.push("");
html=["\""];
_d55.attrs&&html.push(" ",_d55.attrs);
html.push(">");
_d59.push(html.join(""));
_d59.push("");
_d59.push(_d58?"</th>":"</td>");
return _d59;
},isCellNode:function(_d5d){
return Boolean(_d5d&&_d5d!=dojo.doc&&dojo.attr(_d5d,"idx"));
},getCellNodeIndex:function(_d5e){
return _d5e?Number(dojo.attr(_d5e,"idx")):-1;
},getCellNode:function(_d5f,_d60){
for(var i=0,row;row=_d43(_d5f.firstChild,i);i++){
for(var j=0,cell;cell=row.cells[j];j++){
if(this.getCellNodeIndex(cell)==_d60){
return cell;
}
}
}
},findCellTarget:function(_d65,_d66){
var n=_d65;
while(n&&(!this.isCellNode(n)||(n.offsetParent&&_d52 in n.offsetParent.parentNode&&n.offsetParent.parentNode[_d52]!=this.view.id))&&(n!=_d66)){
n=n.parentNode;
}
return n!=_d66?n:null;
},baseDecorateEvent:function(e){
e.dispatch="do"+e.type;
e.grid=this.grid;
e.sourceView=this.view;
e.cellNode=this.findCellTarget(e.target,e.rowNode);
e.cellIndex=this.getCellNodeIndex(e.cellNode);
e.cell=(e.cellIndex>=0?this.grid.getCell(e.cellIndex):null);
},findTarget:function(_d69,_d6a){
var n=_d69;
while(n&&(n!=this.domNode)&&(!(_d6a in n)||(_d52 in n&&n[_d52]!=this.view.id))){
n=n.parentNode;
}
return (n!=this.domNode)?n:null;
},findRowTarget:function(_d6c){
return this.findTarget(_d6c,_d51);
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
var _d75=this.grid.get,_d76=this.view.structure.cells;
for(var j=0,row;(row=_d76[j]);j++){
for(var i=0,cell;(cell=row[i]);i++){
cell.get=cell.get||(cell.value==undefined)&&_d75;
cell.markup=this.generateCellMarkup(cell,cell.cellStyles,cell.cellClasses,false);
}
}
},generateHtml:function(_d7b,_d7c){
var html=this.getTableArray(),v=this.view,_d7f=v.structure.cells,item=this.grid.getItem(_d7c);
dojox.grid.util.fire(this.view,"onBeforeRow",[_d7c,_d7f]);
for(var j=0,row;(row=_d7f[j]);j++){
if(row.hidden||row.header){
continue;
}
html.push(!row.invisible?"<tr>":"<tr class=\"dojoxGridInvisible\">");
for(var i=0,cell,m,cc,cs;(cell=row[i]);i++){
m=cell.markup,cc=cell.customClasses=[],cs=cell.customStyles=[];
m[5]=cell.format(_d7c,item);
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
e.rowIndex=e.rowNode[_d51];
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
},generateHtml:function(_d8a,_d8b){
var html=this.getTableArray(),_d8d=this.view.structure.cells;
dojox.grid.util.fire(this.view,"onBeforeRow",[-1,_d8d]);
for(var j=0,row;(row=_d8d[j]);j++){
if(row.hidden){
continue;
}
html.push(!row.invisible?"<tr>":"<tr class=\"dojoxGridInvisible\">");
for(var i=0,cell,_d92;(cell=row[i]);i++){
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
_d92=this.generateCellMarkup(cell,cell.headerStyles,cell.headerClasses,true);
_d92[5]=(_d8b!=undefined?_d8b:_d8a(cell));
_d92[3]=cell.customStyles.join(";");
_d92[1]=cell.customClasses.join(" ");
html.push(_d92.join(""));
}
html.push("</tr>");
}
html.push("</table>");
return html.join("");
},getCellX:function(e){
var x=e.layerX;
if(dojo.isMoz){
var n=_d49(e.target,_d4d("th"));
x-=(n&&n.offsetLeft)||0;
var t=e.sourceView.getScrollbarWidth();
if(!dojo._isBodyLtr()&&e.sourceView.headerNode.scrollLeft<t){
x-=t;
}
}
var n=_d49(e.target,function(){
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
var i=_d3f(e.cellNode);
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
var _da9=[],_daa=this.tableMap.findOverlappingNodes(e.cellNode);
for(var i=0,cell;(cell=_daa[i]);i++){
_da9.push({node:cell,index:this.getCellNodeIndex(cell),width:cell.offsetWidth});
}
var view=e.sourceView;
var adj=dojo._isBodyLtr()?1:-1;
var _daf=e.grid.views.views;
var _db0=[];
for(var i=view.idx+adj,_db1;(_db1=_daf[i]);i=i+adj){
_db0.push({node:_db1.headerNode,left:window.parseInt(_db1.headerNode.style.left)});
}
var _db2=view.headerContentNode.firstChild;
var drag={scrollLeft:e.sourceView.headerNode.scrollLeft,view:view,node:e.cellNode,index:e.cellIndex,w:dojo.contentBox(e.cellNode).w,vw:dojo.contentBox(view.headerNode).w,table:_db2,tw:dojo.contentBox(_db2).w,spanners:_da9,followers:_db0};
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
},doResizeColumn:function(_db4,_db5,_db6){
var _db7=dojo._isBodyLtr();
var _db8=_db7?_db6.l:-_db6.l;
var w=_db4.w+_db8;
var vw=_db4.vw+_db8;
var tw=_db4.tw+_db8;
if(w>=this.minColWidth){
for(var i=0,s,sw;(s=_db4.spanners[i]);i++){
sw=s.width+_db8;
s.node.style.width=sw+"px";
_db4.view.setColWidth(s.index,sw);
}
for(var i=0,f,fl;(f=_db4.followers[i]);i++){
fl=f.left+_db8;
f.node.style.left=fl+"px";
}
_db4.node.style.width=w+"px";
_db4.view.setColWidth(_db4.index,w);
_db4.view.headerNode.style.width=vw+"px";
_db4.view.setColumnsWidth(tw);
if(!_db7){
_db4.view.headerNode.scrollLeft=_db4.scrollLeft+_db8;
}
}
if(_db4.view.flexCells&&!_db4.view.testFlexCells()){
var t=_d46(_db4.node);
t&&(t.style.width="");
}
},endResizeColumn:function(_dc2){
dojo.destroy(this.moverDiv);
delete this.moverDiv;
this._skipBogusClicks=true;
var conn=dojo.connect(_dc2.view,"update",this,function(){
dojo.disconnect(conn);
this._skipBogusClicks=false;
});
setTimeout(dojo.hitch(_dc2.view,"update"),50);
}});
dg._TableMap=dojo.extend(function(rows){
this.mapRows(rows);
},{map:null,mapRows:function(_dc5){
var _dc6=_dc5.length;
if(!_dc6){
return;
}
this.map=[];
for(var j=0,row;(row=_dc5[j]);j++){
this.map[j]=[];
}
for(var j=0,row;(row=_dc5[j]);j++){
for(var i=0,x=0,cell,_dcc,_dcd;(cell=row[i]);i++){
while(this.map[j][x]){
x++;
}
this.map[j][x]={c:i,r:j};
_dcd=cell.rowSpan||1;
_dcc=cell.colSpan||1;
for(var y=0;y<_dcd;y++){
for(var s=0;s<_dcc;s++){
this.map[j+y][x+s]=this.map[j][x];
}
}
x+=_dcc;
}
}
},dumpMap:function(){
for(var j=0,row,h="";(row=this.map[j]);j++,h=""){
for(var i=0,cell;(cell=row[i]);i++){
h+=cell.r+","+cell.c+"   ";
}
}
},getMapCoords:function(_dd5,_dd6){
for(var j=0,row;(row=this.map[j]);j++){
for(var i=0,cell;(cell=row[i]);i++){
if(cell.c==_dd6&&cell.r==_dd5){
return {j:j,i:i};
}
}
}
return {j:-1,i:-1};
},getNode:function(_ddb,_ddc,_ddd){
var row=_ddb&&_ddb.rows[_ddc];
return row&&row.cells[_ddd];
},_findOverlappingNodes:function(_ddf,_de0,_de1){
var _de2=[];
var m=this.getMapCoords(_de0,_de1);
var row=this.map[m.j];
for(var j=0,row;(row=this.map[j]);j++){
if(j==m.j){
continue;
}
var rw=row[m.i];
var n=(rw?this.getNode(_ddf,rw.r,rw.c):null);
if(n){
_de2.push(n);
}
}
return _de2;
},findOverlappingNodes:function(_de8){
return this._findOverlappingNodes(_d46(_de8),_d41(_de8.parentNode),_d3f(_de8));
}});
})();
}
if(!dojo._hasResource["dojox.grid._View"]){
dojo._hasResource["dojox.grid._View"]=true;
dojo.provide("dojox.grid._View");
(function(){
var _de9=function(_dea,_deb){
return _dea.style.cssText==undefined?_dea.getAttribute("style"):_dea.style.cssText;
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
},setStructure:function(_dec){
var vs=(this.structure=_dec);
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
var _df2=this.hasVScrollbar();
var _df3=dojo.style(this.scrollboxNode,"overflow");
if(this.noscroll||!_df3||_df3=="hidden"){
_df2=false;
}else{
if(_df3=="scroll"){
_df2=true;
}
}
return (_df2?dojox.html.metrics.getScrollbar().w:0);
},getColumnsWidth:function(){
return this.headerContentNode.firstChild.offsetWidth;
},setColumnsWidth:function(_df4){
this.headerContentNode.firstChild.style.width=_df4+"px";
if(this.viewWidth){
this.viewWidth=_df4+"px";
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
var _df5=this.grid.layout.cells;
var _df6=dojo.hitch(this,function(node,_df8){
var inc=_df8?-1:1;
var idx=this.header.getCellNodeIndex(node)+inc;
var cell=_df5[idx];
while(cell&&cell.getHeaderNode()&&cell.getHeaderNode().style.display=="none"){
idx+=inc;
cell=_df5[idx];
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
}),_markTargetAnchor:dojo.hitch(this,function(_dfd){
var src=this.source;
if(src.current==src.targetAnchor&&src.before==_dfd){
return;
}
if(src.targetAnchor&&_df6(src.targetAnchor,src.before)){
src._removeItemClass(_df6(src.targetAnchor,src.before),src.before?"After":"Before");
}
dojo.dnd.Source.prototype._markTargetAnchor.call(src,_dfd);
if(src.targetAnchor&&_df6(src.targetAnchor,src.before)){
src._addItemClass(_df6(src.targetAnchor,src.before),src.before?"After":"Before");
}
}),_unmarkTargetAnchor:dojo.hitch(this,function(){
var src=this.source;
if(!src.targetAnchor){
return;
}
if(src.targetAnchor&&_df6(src.targetAnchor,src.before)){
src._removeItemClass(_df6(src.targetAnchor,src.before),src.before?"After":"Before");
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
},_onDndDropBefore:function(_e00,_e01,copy){
if(dojo.dnd.manager().target!==this.source){
return;
}
this.source._targetNode=this.source.targetAnchor;
this.source._beforeTarget=this.source.before;
var _e03=this.grid.views.views;
var _e04=_e03[_e00.viewIndex];
var _e05=_e03[this.index];
if(_e05!=_e04){
var s=_e04.convertColPctToFixed();
var t=_e05.convertColPctToFixed();
if(s||t){
setTimeout(function(){
_e04.update();
_e05.update();
},50);
}
}
},_onDndDrop:function(_e08,_e09,copy){
if(dojo.dnd.manager().target!==this.source){
if(dojo.dnd.manager().source===this.source){
this._removingColumn=true;
}
return;
}
var _e0b=function(n){
return n?dojo.attr(n,"idx"):null;
};
var w=dojo.marginBox(_e09[0]).w;
if(_e08.viewIndex!==this.index){
var _e0e=this.grid.views.views;
var _e0f=_e0e[_e08.viewIndex];
var _e10=_e0e[this.index];
if(_e0f.viewWidth&&_e0f.viewWidth!="auto"){
_e0f.setColumnsWidth(_e0f.getColumnsWidth()-w);
}
if(_e10.viewWidth&&_e10.viewWidth!="auto"){
_e10.setColumnsWidth(_e10.getColumnsWidth());
}
}
var stn=this.source._targetNode;
var stb=this.source._beforeTarget;
var _e13=this.grid.layout;
var idx=this.index;
delete this.source._targetNode;
delete this.source._beforeTarget;
window.setTimeout(function(){
_e13.moveColumn(_e08.viewIndex,idx,_e0b(_e09[0]),_e0b(stn),stb);
},1);
},renderHeader:function(){
this.headerContentNode.innerHTML=this.header.generateHtml(this._getHeaderContent);
if(this.flexCells){
this.contentWidth=this.getContentWidth();
this.headerContentNode.firstChild.style.width=this.contentWidth;
}
dojox.grid.util.fire(this,"onAfterRow",[-1,this.structure.cells,this.headerContentNode]);
},_getHeaderContent:function(_e15){
var n=_e15.name||_e15.grid.getCellName(_e15);
var ret=["<div class=\"dojoxGridSortNode"];
if(_e15.index!=_e15.grid.getSortIndex()){
ret.push("\">");
}else{
ret=ret.concat([" ",_e15.grid.sortInfo>0?"dojoxGridSortUp":"dojoxGridSortDown","\"><div class=\"dojoxGridArrowButtonChar\">",_e15.grid.sortInfo>0?"&#9650;":"&#9660;","</div><div class=\"dojoxGridArrowButtonNode\" role=\""+(dojo.isFF<3?"wairole:":"")+"presentation\"></div>"]);
}
ret=ret.concat([n,"</div>"]);
return ret.join("");
},resize:function(){
this.adaptHeight();
this.adaptWidth();
},hasHScrollbar:function(_e18){
if(this._hasHScroll==undefined||_e18){
if(this.noscroll){
this._hasHScroll=false;
}else{
var _e19=dojo.style(this.scrollboxNode,"overflow");
if(_e19=="hidden"){
this._hasHScroll=false;
}else{
if(_e19=="scroll"){
this._hasHScroll=true;
}else{
this._hasHScroll=(this.scrollboxNode.offsetWidth<this.contentNode.offsetWidth);
}
}
}
}
return this._hasHScroll;
},hasVScrollbar:function(_e1a){
if(this._hasVScroll==undefined||_e1a){
if(this.noscroll){
this._hasVScroll=false;
}else{
var _e1b=dojo.style(this.scrollboxNode,"overflow");
if(_e1b=="hidden"){
this._hasVScroll=false;
}else{
if(_e1b=="scroll"){
this._hasVScroll=true;
}else{
this._hasVScroll=(this.scrollboxNode.offsetHeight<this.contentNode.offsetHeight);
}
}
}
}
return this._hasVScroll;
},convertColPctToFixed:function(){
var _e1c=false;
var _e1d=dojo.query("th",this.headerContentNode);
var _e1e=dojo.map(_e1d,function(c,vIdx){
var w=c.style.width;
dojo.attr(c,"vIdx",vIdx);
if(w&&w.slice(-1)=="%"){
_e1c=true;
}else{
if(w&&w.slice(-2)=="px"){
return window.parseInt(w,10);
}
}
return dojo.contentBox(c).w;
});
if(_e1c){
dojo.forEach(this.grid.layout.cells,function(cell,idx){
if(cell.view==this){
var _e24=cell.view.getHeaderCellNode(cell.index);
if(_e24&&dojo.hasAttr(_e24,"vIdx")){
var vIdx=window.parseInt(dojo.attr(_e24,"vIdx"));
this.setColWidth(idx,_e1e[vIdx]);
_e1d[vIdx].style.width=cell.unitWidth;
dojo.removeAttr(_e24,"vIdx");
}
}
},this);
return true;
}
return false;
},adaptHeight:function(_e26){
if(!this.grid._autoHeight){
var h=this.domNode.clientHeight;
if(_e26){
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
},renderRow:function(_e2e){
var _e2f=this.createRowNode(_e2e);
this.buildRow(_e2e,_e2f);
this.grid.edit.restore(this,_e2e);
if(this._pendingUpdate){
window.clearTimeout(this._pendingUpdate);
}
this._pendingUpdate=window.setTimeout(dojo.hitch(this,function(){
window.clearTimeout(this._pendingUpdate);
delete this._pendingUpdate;
this.grid._resize();
}),50);
return _e2f;
},createRowNode:function(_e30){
var node=document.createElement("div");
node.className=this.classTag+"Row";
dojo.attr(node,"role","row");
node[dojox.grid.util.gridViewTag]=this.id;
node[dojox.grid.util.rowIndexTag]=_e30;
this.rowNodes[_e30]=node;
return node;
},buildRow:function(_e32,_e33){
this.buildRowContent(_e32,_e33);
this.styleRow(_e32,_e33);
},buildRowContent:function(_e34,_e35){
_e35.innerHTML=this.content.generateHtml(_e34,_e34);
if(this.flexCells&&this.contentWidth){
_e35.firstChild.style.width=this.contentWidth;
}
dojox.grid.util.fire(this,"onAfterRow",[_e34,this.structure.cells,_e35]);
},rowRemoved:function(_e36){
this.grid.edit.save(this,_e36);
delete this.rowNodes[_e36];
},getRowNode:function(_e37){
return this.rowNodes[_e37];
},getCellNode:function(_e38,_e39){
var row=this.getRowNode(_e38);
if(row){
return this.content.getCellNode(row,_e39);
}
},getHeaderCellNode:function(_e3b){
if(this.headerContentNode){
return this.header.getCellNode(this.headerContentNode,_e3b);
}
},styleRow:function(_e3c,_e3d){
_e3d._style=_de9(_e3d);
this.styleRowNode(_e3c,_e3d);
},styleRowNode:function(_e3e,_e3f){
if(_e3f){
this.doStyleRowNode(_e3e,_e3f);
}
},doStyleRowNode:function(_e40,_e41){
this.grid.styleRowNode(_e40,_e41);
},updateRow:function(_e42){
var _e43=this.getRowNode(_e42);
if(_e43){
_e43.style.height="";
this.buildRow(_e42,_e43);
}
return _e43;
},updateRowStyles:function(_e44){
this.styleRowNode(_e44,this.getRowNode(_e44));
},lastTop:0,firstScroll:0,doscroll:function(_e45){
var _e46=dojo._isBodyLtr();
if(this.firstScroll<2){
if((!_e46&&this.firstScroll==1)||(_e46&&this.firstScroll==0)){
var s=dojo.marginBox(this.headerNodeContainer);
if(dojo.isIE){
this.headerNodeContainer.style.width=s.w+this.getScrollbarWidth()+"px";
}else{
if(dojo.isMoz){
this.headerNodeContainer.style.width=s.w-this.getScrollbarWidth()+"px";
this.scrollboxNode.scrollLeft=_e46?this.scrollboxNode.clientWidth-this.scrollboxNode.scrollWidth:this.scrollboxNode.scrollWidth-this.scrollboxNode.clientWidth;
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
},setScrollTop:function(_e49){
this.lastTop=_e49;
this.scrollboxNode.scrollTop=_e49;
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
},setColWidth:function(_e4e,_e4f){
this.grid.setCellWidth(_e4e,_e4f+"px");
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
var _e57=this.manager.source,node;
if(_e57.creator){
node=_e57._normailzedCreator(_e57.getItem(this.manager.nodes[0].id).data,"avatar").node;
}else{
node=this.manager.nodes[0].cloneNode(true);
if(node.tagName.toLowerCase()=="tr"){
var _e59=dd.createElement("table"),_e5a=dd.createElement("tbody");
_e5a.appendChild(node);
_e59.appendChild(_e5a);
node=_e59;
}else{
if(node.tagName.toLowerCase()=="th"){
var _e59=dd.createElement("table"),_e5a=dd.createElement("tbody"),r=dd.createElement("tr");
_e59.cellPadding=_e59.cellSpacing="0";
r.appendChild(node);
_e5a.appendChild(r);
_e59.appendChild(_e5a);
node=_e59;
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
var _e5d=dojo.dnd.manager().makeAvatar;
dojo.dnd.manager().makeAvatar=function(){
var src=this.source;
if(src.viewIndex!==undefined){
return new dojox.grid._GridAvatar(this);
}
return _e5d.call(dojo.dnd.manager());
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
},buildRowContent:function(_e5f,_e60){
var w=this.contentNode.offsetWidth-this.padBorderWidth;
_e60.innerHTML="<table class=\"dojoxGridRowbarTable\" style=\"width:"+w+"px;\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\""+(dojo.isFF<3?"wairole:":"")+"presentation\"><tr><td class=\"dojoxGridRowbarInner\">&nbsp;</td></tr></table>";
},renderHeader:function(){
},resize:function(){
this.adaptHeight();
},adaptWidth:function(){
},doStyleRowNode:function(_e62,_e63){
var n=["dojoxGridRowbar"];
if(this.grid.rows.isOver(_e62)){
n.push("dojoxGridRowbarOver");
}
if(this.grid.selection.isSelected(_e62)){
n.push("dojoxGridRowbarSelected");
}
_e63.className=n.join(" ");
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
dojo.declare("dojox.grid._Layout",null,{constructor:function(_e67){
this.grid=_e67;
},cells:[],structure:null,defaultWidth:"6em",moveColumn:function(_e68,_e69,_e6a,_e6b,_e6c){
var _e6d=this.structure[_e68].cells[0];
var _e6e=this.structure[_e69].cells[0];
var cell=null;
var _e70=0;
var _e71=0;
for(var i=0,c;c=_e6d[i];i++){
if(c.index==_e6a){
_e70=i;
break;
}
}
cell=_e6d.splice(_e70,1)[0];
cell.view=this.grid.views.views[_e69];
for(i=0,c=null;c=_e6e[i];i++){
if(c.index==_e6b){
_e71=i;
break;
}
}
if(!_e6c){
_e71+=1;
}
_e6e.splice(_e71,0,cell);
var _e74=this.grid.getCell(this.grid.getSortIndex());
if(_e74){
_e74._currentlySorted=this.grid.getSortAsc();
}
this.cells=[];
var _e6a=0;
for(var i=0,v;v=this.structure[i];i++){
for(var j=0,cs;cs=v.cells[j];j++){
for(var k=0,c;c=cs[k];k++){
c.index=_e6a;
this.cells.push(c);
if("_currentlySorted" in c){
var si=_e6a+1;
si*=c._currentlySorted?1:-1;
this.grid.sortInfo=si;
delete c._currentlySorted;
}
_e6a++;
}
}
}
this.grid.setupHeaderMenu();
},setColumnVisibility:function(_e7a,_e7b){
var cell=this.cells[_e7a];
if(cell.hidden==_e7b){
cell.hidden=!_e7b;
var v=cell.view,w=v.viewWidth;
if(w&&w!="auto"){
v._togglingColumn=dojo.marginBox(cell.getHeaderNode()).w||0;
}
v.update();
return true;
}else{
return false;
}
},addCellDef:function(_e7f,_e80,_e81){
var self=this;
var _e83=function(_e84){
var w=0;
if(_e84.colSpan>1){
w=0;
}else{
w=_e84.width||self._defaultCellProps.width||self.defaultWidth;
if(!isNaN(w)){
w=w+"em";
}
}
return w;
};
var _e86={grid:this.grid,subrow:_e7f,layoutIndex:_e80,index:this.cells.length};
if(_e81&&_e81 instanceof dojox.grid.cells._Base){
var _e87=dojo.clone(_e81);
_e86.unitWidth=_e83(_e87._props);
_e87=dojo.mixin(_e87,this._defaultCellProps,_e81._props,_e86);
return _e87;
}
var _e88=_e81.type||this._defaultCellProps.type||dojox.grid.cells.Cell;
_e86.unitWidth=_e83(_e81);
return new _e88(dojo.mixin({},this._defaultCellProps,_e81,_e86));
},addRowDef:function(_e89,_e8a){
var _e8b=[];
var _e8c=0,_e8d=0,_e8e=true;
for(var i=0,def,cell;(def=_e8a[i]);i++){
cell=this.addCellDef(_e89,i,def);
_e8b.push(cell);
this.cells.push(cell);
if(_e8e&&cell.relWidth){
_e8c+=cell.relWidth;
}else{
if(cell.width){
var w=cell.width;
if(typeof w=="string"&&w.slice(-1)=="%"){
_e8d+=window.parseInt(w,10);
}else{
if(w=="auto"){
_e8e=false;
}
}
}
}
}
if(_e8c&&_e8e){
dojo.forEach(_e8b,function(cell){
if(cell.relWidth){
cell.width=cell.unitWidth=((cell.relWidth/_e8c)*(100-_e8d))+"%";
}
});
}
return _e8b;
},addRowsDef:function(_e94){
var _e95=[];
if(dojo.isArray(_e94)){
if(dojo.isArray(_e94[0])){
for(var i=0,row;_e94&&(row=_e94[i]);i++){
_e95.push(this.addRowDef(i,row));
}
}else{
_e95.push(this.addRowDef(0,_e94));
}
}
return _e95;
},addViewDef:function(_e98){
this._defaultCellProps=_e98.defaultCell||{};
if(_e98.width&&_e98.width=="auto"){
delete _e98.width;
}
return dojo.mixin({},_e98,{cells:this.addRowsDef(_e98.rows||_e98.cells)});
},setStructure:function(_e99){
this.fieldIndex=0;
this.cells=[];
var s=this.structure=[];
if(this.grid.rowSelector){
var sel={type:dojox._scopeName+".grid._RowSelector"};
if(dojo.isString(this.grid.rowSelector)){
var _e9c=this.grid.rowSelector;
if(_e9c=="false"){
sel=null;
}else{
if(_e9c!="true"){
sel["width"]=_e9c;
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
var _e9d=function(def){
return ("name" in def||"field" in def||"get" in def);
};
var _e9f=function(def){
if(dojo.isArray(def)){
if(dojo.isArray(def[0])||_e9d(def[0])){
return true;
}
}
return false;
};
var _ea1=function(def){
return (def!=null&&dojo.isObject(def)&&("cells" in def||"rows" in def||("type" in def&&!_e9d(def))));
};
if(dojo.isArray(_e99)){
var _ea3=false;
for(var i=0,st;(st=_e99[i]);i++){
if(_ea1(st)){
_ea3=true;
break;
}
}
if(!_ea3){
s.push(this.addViewDef({cells:_e99}));
}else{
for(var i=0,st;(st=_e99[i]);i++){
if(_e9f(st)){
s.push(this.addViewDef({cells:st}));
}else{
if(_ea1(st)){
s.push(this.addViewDef(st));
}
}
}
}
}else{
if(_ea1(_e99)){
s.push(this.addViewDef(_e99));
}
}
this.cellCount=this.cells.length;
this.grid.setupHeaderMenu();
}});
}
if(!dojo._hasResource["dojox.grid._ViewManager"]){
dojo._hasResource["dojox.grid._ViewManager"]=true;
dojo.provide("dojox.grid._ViewManager");
dojo.declare("dojox.grid._ViewManager",null,{constructor:function(_ea6){
this.grid=_ea6;
},defaultWidth:200,views:[],resize:function(){
this.onEach("resize");
},render:function(){
this.onEach("render");
},addView:function(_ea7){
_ea7.idx=this.views.length;
this.views.push(_ea7);
},destroyViews:function(){
for(var i=0,v;v=this.views[i];i++){
v.destroy();
}
this.views=[];
},getContentNodes:function(){
var _eaa=[];
for(var i=0,v;v=this.views[i];i++){
_eaa.push(v.contentNode);
}
return _eaa;
},forEach:function(_ead){
for(var i=0,v;v=this.views[i];i++){
_ead(v,i);
}
},onEach:function(_eb0,_eb1){
_eb1=_eb1||[];
for(var i=0,v;v=this.views[i];i++){
if(_eb0 in v){
v[_eb0].apply(v,_eb1);
}
}
},normalizeHeaderNodeHeight:function(){
var _eb4=[];
for(var i=0,v;(v=this.views[i]);i++){
if(v.headerContentNode.firstChild){
_eb4.push(v.headerContentNode);
}
}
this.normalizeRowNodeHeights(_eb4);
},normalizeRowNodeHeights:function(_eb7){
var h=0;
for(var i=0,n,o;(n=_eb7[i]);i++){
h=Math.max(h,dojo.marginBox(n.firstChild).h);
}
h=(h>=0?h:0);
for(var i=0,n;(n=_eb7[i]);i++){
dojo.marginBox(n.firstChild,{h:h});
}
if(_eb7&&_eb7[0]&&_eb7[0].parentNode){
_eb7[0].parentNode.offsetHeight;
}
},resetHeaderNodeHeight:function(){
for(var i=0,v,n;(v=this.views[i]);i++){
n=v.headerContentNode.firstChild;
if(n){
n.style.height="";
}
}
},renormalizeRow:function(_ebf){
var _ec0=[];
for(var i=0,v,n;(v=this.views[i])&&(n=v.getRowNode(_ebf));i++){
n.firstChild.style.height="";
_ec0.push(n);
}
this.normalizeRowNodeHeights(_ec0);
},getViewWidth:function(_ec4){
return this.views[_ec4].getWidth()||this.defaultWidth;
},measureHeader:function(){
this.resetHeaderNodeHeight();
this.forEach(function(_ec5){
_ec5.headerContentNode.style.height="";
});
var h=0;
this.forEach(function(_ec7){
h=Math.max(_ec7.headerNode.offsetHeight,h);
});
return h;
},measureContent:function(){
var h=0;
this.forEach(function(_ec9){
h=Math.max(_ec9.domNode.offsetHeight,h);
});
return h;
},findClient:function(_eca){
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
var _ed5=function(v,l){
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
_ed5(v,l);
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
_ed5(v,r);
}
if(c<len){
v=this.views[c];
vw=Math.max(1,r-l);
v.setSize(vw+"px",0);
_ed5(v,l);
}
return l;
},renderRow:function(_edc,_edd){
var _ede=[];
for(var i=0,v,n,_ee2;(v=this.views[i])&&(n=_edd[i]);i++){
_ee2=v.renderRow(_edc);
n.appendChild(_ee2);
_ede.push(_ee2);
}
this.normalizeRowNodeHeights(_ede);
},rowRemoved:function(_ee3){
this.onEach("rowRemoved",[_ee3]);
},updateRow:function(_ee4){
for(var i=0,v;v=this.views[i];i++){
v.updateRow(_ee4);
}
this.renormalizeRow(_ee4);
},updateRowStyles:function(_ee7){
this.onEach("updateRowStyles",[_ee7]);
},setScrollTop:function(_ee8){
var top=_ee8;
for(var i=0,v;v=this.views[i];i++){
top=v.setScrollTop(_ee8);
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
var _eee=function(_eef,_ef0){
if(_eef.style.cssText==undefined){
_eef.setAttribute("style",_ef0);
}else{
_eef.style.cssText=_ef0;
}
};
dojo.declare("dojox.grid._RowManager",null,{constructor:function(_ef1){
this.grid=_ef1;
},linesToEms:2,overRow:-2,prepareStylingRow:function(_ef2,_ef3){
return {index:_ef2,node:_ef3,odd:Boolean(_ef2&1),selected:this.grid.selection.isSelected(_ef2),over:this.isOver(_ef2),customStyles:"",customClasses:"dojoxGridRow"};
},styleRowNode:function(_ef4,_ef5){
var row=this.prepareStylingRow(_ef4,_ef5);
this.grid.onStyleRow(row);
this.applyStyles(row);
},applyStyles:function(_ef7){
var i=_ef7;
i.node.className=i.customClasses;
var h=i.node.style.height;
_eee(i.node,i.customStyles+";"+(i.node._style||""));
i.node.style.height=h;
},updateStyles:function(_efa){
this.grid.updateRowStyles(_efa);
},setOverRow:function(_efb){
var last=this.overRow;
this.overRow=_efb;
if((last!=this.overRow)&&(last>=0)){
this.updateStyles(last);
}
this.updateStyles(this.overRow);
},isOver:function(_efd){
return (this.overRow==_efd);
}});
})();
}
if(!dojo._hasResource["dojox.grid._FocusManager"]){
dojo._hasResource["dojox.grid._FocusManager"]=true;
dojo.provide("dojox.grid._FocusManager");
dojo.declare("dojox.grid._FocusManager",null,{constructor:function(_efe){
this.grid=_efe;
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
},isFocusCell:function(_eff,_f00){
return (this.cell==_eff)&&(this.rowIndex==_f00);
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
},_focusifyCellNode:function(_f01){
var n=this.cell&&this.cell.getNode(this.rowIndex);
if(n){
dojo.toggleClass(n,this.focusClass,_f01);
if(_f01){
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
var _f05=this._findHeaderCells();
for(var i=0;i<_f05.length;i++){
this._connects.push(dojo.connect(_f05[i],"onfocus",this,"doColHeaderFocus"));
this._connects.push(dojo.connect(_f05[i],"onblur",this,"doColHeaderBlur"));
}
},_findHeaderCells:function(){
var _f07=dojo.query("th",this.grid.viewsHeaderNode);
var _f08=[];
for(var i=0;i<_f07.length;i++){
var _f0a=_f07[i];
var _f0b=dojo.hasAttr(_f0a,"tabindex");
var _f0c=dojo.attr(_f0a,"tabindex");
if(_f0b&&_f0c<0){
_f08.push(_f0a);
}
}
return _f08;
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
},_scrollInfo:function(cell,_f10){
if(cell){
var cl=cell,sbn=cl.view.scrollboxNode,sbnr={w:sbn.clientWidth,l:sbn.scrollLeft,t:sbn.scrollTop,h:sbn.clientHeight},rn=cl.view.getRowNode(this.rowIndex);
return {c:cl,s:sbn,sr:sbnr,n:(_f10?_f10:cell.getNode(this.rowIndex)),r:rn};
}
return null;
},_scrollHeader:function(_f15){
var info=null;
if(this._colHeadNode){
var cell=this.grid.getCell(_f15);
info=this._scrollInfo(cell,cell.getNode(0));
}
if(info&&info.s&&info.sr&&info.n){
var _f18=info.sr.l+info.sr.w;
if(info.n.offsetLeft+info.n.offsetWidth>_f18){
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
},styleRow:function(_f19){
return;
},setFocusIndex:function(_f1a,_f1b){
this.setFocusCell(this.grid.getCell(_f1b),_f1a);
},setFocusCell:function(_f1c,_f1d){
if(_f1c&&!this.isFocusCell(_f1c,_f1d)){
this.tabbingOut=false;
this._colHeadNode=this._colHeadFocusIdx=null;
this.focusGridView();
this._focusifyCellNode(false);
this.cell=_f1c;
this.rowIndex=_f1d;
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
var _f22=this.grid.getCell(col);
if(!this.isLastFocusCell()&&!_f22.editable){
this.cell=_f22;
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
var _f25=this.grid.getCell(col);
if(!this.isFirstFocusCell()&&!_f25.editable){
this.cell=_f25;
this.rowIndex=row;
this.previous();
return;
}
}
this.setFocusIndex(row,col);
}
},move:function(_f26,_f27){
if(this.isNavHeader()){
var _f28=this._findHeaderCells();
var _f29=dojo.indexOf(_f28,this._colHeadNode);
_f29+=_f27;
if((_f29>=0)&&(_f29<_f28.length)){
this._colHeadNode=_f28[_f29];
this._colHeadFocusIdx=_f29;
this._scrollHeader(_f29);
this._colHeadNode.focus();
}
}else{
if(this.cell){
var sc=this.grid.scroller,r=this.rowIndex,rc=this.grid.rowCount-1,row=Math.min(rc,Math.max(0,r+_f26));
if(_f26){
if(_f26>0){
if(row>sc.getLastPageRow(sc.page)){
this.grid.setScrollTop(this.grid.scrollTop+sc.findScrollTop(row)-sc.findScrollTop(r));
}
}else{
if(_f26<0){
if(row<=sc.getPageRow(sc.page)){
this.grid.setScrollTop(this.grid.scrollTop-sc.findScrollTop(r)-sc.findScrollTop(row));
}
}
}
}
var cc=this.grid.layout.cellCount-1,i=this.cell.index,col=Math.min(cc,Math.max(0,i+_f27));
this.setFocusIndex(row,col);
if(_f26){
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
var _f33=this.grid.rowCount==0;
if(e.target===this.grid.domNode){
this.focusHeader();
dojo.stopEvent(e);
}else{
if(this.isNavHeader()){
this._colHeadNode=this._colHeadFocusIdx=null;
if(this.isNoFocusCell()&&!_f33){
this.setFocusIndex(0,0);
}else{
if(this.cell&&!_f33){
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
},tabOut:function(_f34){
this.tabbingOut=true;
_f34.focus();
},focusGridView:function(){
dojox.grid.util.fire(this.focusView,"focus");
},focusGrid:function(_f35){
this.focusGridView();
this._focusifyCellNode(true);
},focusHeader:function(){
var _f36=this._findHeaderCells();
if(!this._colHeadFocusIdx){
if(this.isNoFocusCell()){
this._colHeadFocusIdx=0;
}else{
this._colHeadFocusIdx=this.cell.index;
}
}
this._colHeadNode=_f36[this._colHeadFocusIdx];
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
dojo.declare("dojox.grid._EditManager",null,{constructor:function(_f3e){
this.grid=_f3e;
this.connections=[];
if(dojo.isIE){
this.connections.push(dojo.connect(document.body,"onfocus",dojo.hitch(this,"_boomerangFocus")));
}
},info:{},destroy:function(){
dojo.forEach(this.connections,dojo.disconnect);
},cellFocus:function(_f3f,_f40){
if(this.grid.singleClickEdit||this.isEditRow(_f40)){
this.setEditCell(_f3f,_f40);
}else{
this.apply();
}
if(this.isEditing()||(_f3f&&_f3f.editable&&_f3f.alwaysEditing)){
this._focusEditor(_f3f,_f40);
}
},rowClick:function(e){
if(this.isEditing()&&!this.isEditRow(e.rowIndex)){
this.apply();
}
},styleRow:function(_f42){
if(_f42.index==this.info.rowIndex){
_f42.customClasses+=" dojoxGridRowEditing";
}
},dispatchEvent:function(e){
var c=e.cell,ed=(c&&c["editable"])?c:0;
return ed&&ed.dispatchEvent(e.dispatch,e);
},isEditing:function(){
return this.info.rowIndex!==undefined;
},isEditCell:function(_f46,_f47){
return (this.info.rowIndex===_f46)&&(this.info.cell.index==_f47);
},isEditRow:function(_f48){
return this.info.rowIndex===_f48;
},setEditCell:function(_f49,_f4a){
if(!this.isEditCell(_f4a,_f49.index)&&this.grid.canEdit&&this.grid.canEdit(_f49,_f4a)){
this.start(_f49,_f4a,this.isEditRow(_f4a)||_f49.editable);
}
},_focusEditor:function(_f4b,_f4c){
dojox.grid.util.fire(_f4b,"focus",[_f4c]);
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
},start:function(_f4d,_f4e,_f4f){
this.grid.beginUpdate();
this.editorApply();
if(this.isEditing()&&!this.isEditRow(_f4e)){
this.applyRowEdit();
this.grid.updateRow(_f4e);
}
if(_f4f){
this.info={cell:_f4d,rowIndex:_f4e};
this.grid.doStartEdit(_f4d,_f4e);
this.grid.updateRow(_f4e);
}else{
this.info={};
}
this.grid.endUpdate();
this.grid.focus.focusGrid();
this._focusEditor(_f4d,_f4e);
this._doCatchBoomerang();
},_editorDo:function(_f50){
var c=this.info.cell;
c&&c.editable&&c[_f50](this.info.rowIndex);
},editorApply:function(){
this._editorDo("apply");
},editorCancel:function(){
this._editorDo("cancel");
},applyCellEdit:function(_f52,_f53,_f54){
if(this.grid.canEdit(_f53,_f54)){
this.grid.doApplyCellEdit(_f52,_f54,_f53.field);
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
},save:function(_f55,_f56){
var c=this.info.cell;
if(this.isEditRow(_f55)&&(!_f56||c.view==_f56)&&c.editable){
c.save(c,this.info.rowIndex);
}
},restore:function(_f58,_f59){
var c=this.info.cell;
if(this.isEditRow(_f59)&&c.view==_f58&&c.editable){
c.restore(c,this.info.rowIndex);
}
}});
}
if(!dojo._hasResource["dojox.grid.Selection"]){
dojo._hasResource["dojox.grid.Selection"]=true;
dojo.provide("dojox.grid.Selection");
dojo.declare("dojox.grid.Selection",null,{constructor:function(_f5b){
this.grid=_f5b;
this.selected=[];
this.setMode(_f5b.selectionMode);
},mode:"extended",selected:null,updating:0,selectedIndex:-1,setMode:function(mode){
if(this.selected.length){
this.deselectAll();
}
if(mode!="extended"&&mode!="multiple"&&mode!="single"&&mode!="none"){
this.mode="extended";
}else{
this.mode=mode;
}
},onCanSelect:function(_f5d){
return this.grid.onCanSelect(_f5d);
},onCanDeselect:function(_f5e){
return this.grid.onCanDeselect(_f5e);
},onSelected:function(_f5f){
},onDeselected:function(_f60){
},onChanging:function(){
},onChanged:function(){
},isSelected:function(_f61){
if(this.mode=="none"){
return false;
}
return this.selected[_f61];
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
},getNextSelected:function(_f64){
if(this.mode=="none"){
return -1;
}
for(var i=_f64+1,l=this.selected.length;i<l;i++){
if(this.selected[i]){
return i;
}
}
return -1;
},getSelected:function(){
var _f67=[];
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
_f67.push(i);
}
}
return _f67;
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
},select:function(_f6c){
if(this.mode=="none"){
return;
}
if(this.mode!="multiple"){
this.deselectAll(_f6c);
this.addToSelection(_f6c);
}else{
this.toggleSelect(_f6c);
}
},addToSelection:function(_f6d){
if(this.mode=="none"){
return;
}
_f6d=Number(_f6d);
if(this.selected[_f6d]){
this.selectedIndex=_f6d;
}else{
if(this.onCanSelect(_f6d)!==false){
this.selectedIndex=_f6d;
this._beginUpdate();
this.selected[_f6d]=true;
this.onSelected(_f6d);
this._endUpdate();
}
}
},deselect:function(_f6e){
if(this.mode=="none"){
return;
}
_f6e=Number(_f6e);
if(this.selectedIndex==_f6e){
this.selectedIndex=-1;
}
if(this.selected[_f6e]){
if(this.onCanDeselect(_f6e)===false){
return;
}
this._beginUpdate();
delete this.selected[_f6e];
this.onDeselected(_f6e);
this._endUpdate();
}
},setSelected:function(_f6f,_f70){
this[(_f70?"addToSelection":"deselect")](_f6f);
},toggleSelect:function(_f71){
this.setSelected(_f71,!this.selected[_f71]);
},_range:function(_f72,inTo,func){
var s=(_f72>=0?_f72:inTo),e=inTo;
if(s>e){
e=s;
s=inTo;
}
for(var i=s;i<=e;i++){
func(i);
}
},selectRange:function(_f78,inTo){
this._range(_f78,inTo,dojo.hitch(this,"addToSelection"));
},deselectRange:function(_f7a,inTo){
this._range(_f7a,inTo,dojo.hitch(this,"deselect"));
},insert:function(_f7c){
this.selected.splice(_f7c,0,false);
if(this.selectedIndex>=_f7c){
this.selectedIndex++;
}
},remove:function(_f7d){
this.selected.splice(_f7d,1);
if(this.selectedIndex>=_f7d){
this.selectedIndex--;
}
},deselectAll:function(_f7e){
for(var i in this.selected){
if((i!=_f7e)&&(this.selected[i]===true)){
this.deselect(i);
}
}
},clickSelect:function(_f80,_f81,_f82){
if(this.mode=="none"){
return;
}
this._beginUpdate();
if(this.mode!="extended"){
this.select(_f80);
}else{
var _f83=this.selectedIndex;
if(!_f81){
this.deselectAll(_f80);
}
if(_f82){
this.selectRange(_f83,_f80);
}else{
if(_f81){
this.toggleSelect(_f80);
}else{
this.addToSelection(_f80);
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
},onStyleRow:function(_f88){
var i=_f88;
i.customClasses+=(i.odd?" dojoxGridRowOdd":"")+(i.selected?" dojoxGridRowSelected":"")+(i.over?" dojoxGridRowOver":"");
this.focus.styleRow(_f88);
this.edit.styleRow(_f88);
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
var _f8c=this.focus.getHeaderIndex();
if(_f8c>=0){
this.setSortIndex(_f8c);
break;
}else{
this.selection.clickSelect(this.focus.rowIndex,dojo.dnd.getCopyKeyState(e),e.shiftKey);
}
dojo.stopEvent(e);
}
if(!e.shiftKey){
var _f8d=this.edit.isEditing();
this.edit.apply();
if(!_f8d){
this.edit.setEditCell(this.focus.cell,this.focus.rowIndex);
}
}
if(!this.edit.isEditing()){
var _f8e=this.focus.focusView||this.views.views[0];
_f8e.content.decorateEvent(e);
this.onRowClick(e);
}
break;
case dk.SPACE:
if(!this.edit.isEditing()){
var _f8c=this.focus.getHeaderIndex();
if(_f8c>=0){
this.setSortIndex(_f8c);
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
var _f8f=(e.keyCode==dk.LEFT_ARROW)?1:-1;
if(dojo._isBodyLtr()){
_f8f*=-1;
}
this.focus.move(0,_f8f);
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
},onCellFocus:function(_f9c,_f9d){
this.edit.cellFocus(_f9c,_f9d);
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
},onStartEdit:function(_faf,_fb0){
},onApplyCellEdit:function(_fb1,_fb2,_fb3){
},onCancelEdit:function(_fb4){
},onApplyEdit:function(_fb5){
},onCanSelect:function(_fb6){
return true;
},onCanDeselect:function(_fb7){
return true;
},onSelected:function(_fb8){
this.updateRowStyles(_fb8);
},onDeselected:function(_fb9){
this.updateRowStyles(_fb9);
},onSelectionChanged:function(){
}});
}
if(!dojo._hasResource["dojox.grid._Grid"]){
dojo._hasResource["dojox.grid._Grid"]=true;
dojo.provide("dojox.grid._Grid");
(function(){
var jobs={cancel:function(_fbb){
if(_fbb){
clearTimeout(_fbb);
}
},jobs:[],job:function(_fbc,_fbd,_fbe){
jobs.cancelJob(_fbc);
var job=function(){
delete jobs.jobs[_fbc];
_fbe();
};
jobs.jobs[_fbc]=setTimeout(job,_fbd);
},cancelJob:function(_fc0){
jobs.cancel(jobs.jobs[_fc0]);
}};
dojo.declare("dojox.grid._Grid",[dijit._Widget,dijit._Templated,dojox.grid._Events],{templateString:"<div class=\"dojoxGrid\" hidefocus=\"hidefocus\" wairole=\"grid\" dojoAttachEvent=\"onmouseout:_mouseOut\">\r\n\t<div class=\"dojoxGridMasterHeader\" dojoAttachPoint=\"viewsHeaderNode\" tabindex=\"-1\" wairole=\"presentation\"></div>\r\n\t<div class=\"dojoxGridMasterView\" dojoAttachPoint=\"viewsNode\" wairole=\"presentation\"></div>\r\n\t<div class=\"dojoxGridMasterMessages\" style=\"display: none;\" dojoAttachPoint=\"messagesNode\"></div>\r\n\t<span dojoAttachPoint=\"lastFocusNode\" tabindex=\"0\"></span>\r\n</div>\r\n",classTag:"dojoxGrid",get:function(_fc1){
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
var _fc2=dojo.i18n.getLocalization("dijit","loading",this.lang);
this.loadingMessage=dojo.string.substitute(this.loadingMessage,_fc2);
this.errorMessage=dojo.string.substitute(this.errorMessage,_fc2);
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
},_setAutoHeightAttr:function(ah,_fc5){
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
if(this._started&&!_fc5){
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
},createView:function(_fc7,idx){
var c=dojo.getObject(_fc7);
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
},_setStructureAttr:function(_fcd){
var s=_fcd;
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
},setStructure:function(_fcf){
dojo.deprecated("dojox.grid._Grid.setStructure(obj)","use dojox.grid._Grid.attr('structure', obj) instead.","2.0");
this._setStructureAttr(_fcf);
},getColumnTogglingItems:function(){
return dojo.map(this.layout.cells,function(cell){
if(!cell.menuItems){
cell.menuItems=[];
}
var self=this;
var item=new dijit.CheckedMenuItem({label:cell.name,checked:!cell.hidden,_gridCell:cell,onChange:function(_fd3){
if(self.layout.setColumnVisibility(this._gridCell.index,_fd3)){
var _fd4=this._gridCell.menuItems;
if(_fd4.length>1){
dojo.forEach(_fd4,function(item){
if(item!==this){
item.setAttribute("checked",_fd3);
}
},this);
}
var _fd3=dojo.filter(self.layout.cells,function(c){
if(c.menuItems.length>1){
dojo.forEach(c.menuItems,"item.attr('disabled', false);");
}else{
c.menuItems[0].attr("disabled",false);
}
return !c.hidden;
});
if(_fd3.length==1){
dojo.forEach(_fd3[0].menuItems,"item.attr('disabled', true);");
}
}
},destroy:function(){
var _fd7=dojo.indexOf(this._gridCell.menuItems,this);
this._gridCell.menuItems.splice(_fd7,1);
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
},_fetch:function(_fdc){
this.setScrollTop(0);
},getItem:function(_fdd){
return null;
},showMessage:function(_fde){
if(_fde){
this.messagesNode.innerHTML=_fde;
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
},resize:function(_fdf,_fe0){
this._resize(_fdf,_fe0);
this.sizeChange();
},_getPadBorder:function(){
this._padBorder=this._padBorder||dojo._getPadBorderExtents(this.domNode);
return this._padBorder;
},_getHeaderHeight:function(){
var vns=this.viewsHeaderNode.style,t=vns.display=="none"?0:this.views.measureHeader();
vns.height=t+"px";
this.views.normalizeHeaderNodeHeight();
return t;
},_resize:function(_fe3,_fe4){
var pn=this.domNode.parentNode;
if(!pn||pn.nodeType!=1||!this.hasLayout()||pn.style.visibility=="hidden"||pn.style.display=="none"){
return;
}
var _fe6=this._getPadBorder();
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
if(this.domNode.clientHeight<=_fe6.h){
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
if(_fe4){
_fe3=_fe4;
}
if(_fe3){
dojo.marginBox(this.domNode,_fe3);
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
},adaptHeight:function(_feb){
var t=_feb||this._getHeaderHeight();
var h=(this._autoHeight?-1:Math.max(this.domNode.clientHeight-t,0)||0);
this.views.onEach("setSize",[0,h]);
this.views.onEach("adaptHeight");
if(!this._autoHeight){
var _fee=0,_fef=0;
var _ff0=dojo.filter(this.views.views,function(v){
var has=v.hasHScrollbar();
if(has){
_fee++;
}else{
_fef++;
}
return (!has);
});
if(_fee>0&&_fef>0){
dojo.forEach(_ff0,function(v){
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
},renderRow:function(_ff5,_ff6){
this.views.renderRow(_ff5,_ff6);
},rowRemoved:function(_ff7){
this.views.rowRemoved(_ff7);
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
var _ffa=this.scrollTop;
this.prerender();
this.scroller.invalidateNodes();
this.setScrollTop(_ffa);
this.postrender();
},update:function(){
this.render();
},updateRow:function(_ffb){
_ffb=Number(_ffb);
if(this.updating){
this.invalidated[_ffb]=true;
}else{
this.views.updateRow(_ffb);
this.scroller.rowHeightChanged(_ffb);
}
},updateRows:function(_ffc,_ffd){
_ffc=Number(_ffc);
_ffd=Number(_ffd);
if(this.updating){
for(var i=0;i<_ffd;i++){
this.invalidated[i+_ffc]=true;
}
}else{
for(var i=0;i<_ffd;i++){
this.views.updateRow(i+_ffc);
}
this.scroller.rowHeightChanged(_ffc);
}
},updateRowCount:function(_fff){
if(this.updating){
this.invalidated.rowCount=_fff;
}else{
this.rowCount=_fff;
this._setAutoHeightAttr(this.autoHeight,true);
if(this.layout.cells.length){
this.scroller.updateRowCount(_fff);
}
this._resize();
if(this.layout.cells.length){
this.setScrollTop(this.scrollTop);
}
}
},updateRowStyles:function(_1000){
this.views.updateRowStyles(_1000);
},rowHeightChanged:function(_1001){
this.views.renormalizeRow(_1001);
this.scroller.rowHeightChanged(_1001);
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
jobs.job("dojoxGridScroll",200,dojo.hitch(this,"finishScrollJob"));
}else{
this.setScrollTop(inTop);
}
},finishScrollJob:function(){
this.delayScroll=false;
this.setScrollTop(this.scrollTop);
},setScrollTop:function(inTop){
this.scroller.scroll(this.views.setScrollTop(inTop));
},scrollToRow:function(_1005){
this.setScrollTop(this.scroller.findScrollTop(_1005)+1);
},styleRowNode:function(_1006,_1007){
if(_1007){
this.rows.styleRowNode(_1006,_1007);
}
},_mouseOut:function(e){
this.rows.setOverRow(-2);
},getCell:function(_1009){
return this.layout.cells[_1009];
},setCellWidth:function(_100a,_100b){
this.getCell(_100a).unitWidth=_100b;
},getCellName:function(_100c){
return "Cell "+_100c.index;
},canSort:function(_100d){
},sort:function(){
},getSortAsc:function(_100e){
_100e=_100e==undefined?this.sortInfo:_100e;
return Boolean(_100e>0);
},getSortIndex:function(_100f){
_100f=_100f==undefined?this.sortInfo:_100f;
return Math.abs(_100f)-1;
},setSortIndex:function(_1010,inAsc){
var si=_1010+1;
if(inAsc!=undefined){
si*=(inAsc?1:-1);
}else{
if(this.getSortIndex()==_1010){
si=-this.sortInfo;
}
}
this.setSortInfo(si);
},setSortInfo:function(_1013){
if(this.canSort(_1013)){
this.sortInfo=_1013;
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
},doStartEdit:function(_1021,_1022){
this.onStartEdit(_1021,_1022);
},doApplyCellEdit:function(_1023,_1024,_1025){
this.onApplyCellEdit(_1023,_1024,_1025);
},doCancelEdit:function(_1026){
this.onCancelEdit(_1026);
},doApplyEdit:function(_1027){
this.onApplyEdit(_1027);
},addRow:function(){
this.updateRowCount(this.attr("rowCount")+1);
},removeSelectedRows:function(){
this.updateRowCount(Math.max(0,this.attr("rowCount")-this.selection.getSelected().length));
this.selection.clear();
}});
dojox.grid._Grid.markupFactory=function(props,node,ctor,_102b){
var d=dojo;
var _102d=function(n){
var w=d.attr(n,"width")||"auto";
if((w!="auto")&&(w.slice(-2)!="em")&&(w.slice(-1)!="%")){
w=parseInt(w)+"px";
}
return w;
};
if(!props.structure&&node.nodeName.toLowerCase()=="table"){
props.structure=d.query("> colgroup",node).map(function(cg){
var sv=d.attr(cg,"span");
var v={noscroll:(d.attr(cg,"noscroll")=="true")?true:false,__span:(!!sv?parseInt(sv):1),cells:[]};
if(d.hasAttr(cg,"width")){
v.width=_102d(cg);
}
return v;
});
if(!props.structure.length){
props.structure.push({__span:Infinity,cells:[]});
}
d.query("thead > tr",node).forEach(function(tr,_1034){
var _1035=0;
var _1036=0;
var _1037;
var cView=null;
d.query("> th",tr).map(function(th){
if(!cView){
_1037=0;
cView=props.structure[0];
}else{
if(_1035>=(_1037+cView.__span)){
_1036++;
_1037+=cView.__span;
var _103a=cView;
cView=props.structure[_1036];
}
}
var cell={name:d.trim(d.attr(th,"name")||th.innerHTML),colSpan:parseInt(d.attr(th,"colspan")||1,10),type:d.trim(d.attr(th,"cellType")||"")};
_1035+=cell.colSpan;
var _103c=d.attr(th,"rowspan");
if(_103c){
cell.rowSpan=_103c;
}
if(d.hasAttr(th,"width")){
cell.width=_102d(th);
}
if(d.hasAttr(th,"relWidth")){
cell.relWidth=window.parseInt(dojo.attr(th,"relWidth"),10);
}
if(d.hasAttr(th,"hidden")){
cell.hidden=d.attr(th,"hidden")=="true";
}
if(_102b){
_102b(th,cell);
}
cell.type=cell.type?dojo.getObject(cell.type):dojox.grid.cells.Cell;
if(cell.type&&cell.type.markupFactory){
cell.type.markupFactory(th,cell);
}
if(!cView.cells[_1034]){
cView.cells[_1034]=[];
}
cView.cells[_1034].push(cell);
});
});
}
return new ctor(props,node);
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
},getNextSelected:function(_103e){
var _103f=this.grid.getItemIndex(_103e);
var idx=dojox.grid.Selection.prototype.getNextSelected.call(this,_103f);
if(idx==-1){
return null;
}
return this.grid.getItem(idx);
},getSelected:function(){
var _1041=[];
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
_1041.push(this.grid.getItem(i));
}
}
return _1041;
},addToSelection:function(_1044){
if(this.mode=="none"){
return;
}
var idx=null;
if(typeof _1044=="number"||typeof _1044=="string"){
idx=_1044;
}else{
idx=this.grid.getItemIndex(_1044);
}
dojox.grid.Selection.prototype.addToSelection.call(this,idx);
},deselect:function(_1046){
if(this.mode=="none"){
return;
}
var idx=null;
if(typeof _1046=="number"||typeof _1046=="string"){
idx=_1046;
}else{
idx=this.grid.getItemIndex(_1046);
}
dojox.grid.Selection.prototype.deselect.call(this,idx);
},deselectAll:function(_1048){
var idx=null;
if(_1048||typeof _1048=="number"){
if(typeof _1048=="number"||typeof _1048=="string"){
idx=_1048;
}else{
idx=this.grid.getItemIndex(_1048);
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
},get:function(_104a,_104b){
return (!_104b?this.defaultValue:(!this.field?this.value:this.grid.store.getValue(_104b,this.field)));
},_onSet:function(item,_104d,_104e,_104f){
var idx=this.getItemIndex(item);
if(idx>-1){
this.updateRow(idx);
}
},_addItem:function(item,index,_1053){
var idty=this._hasIdentity?this.store.getIdentity(item):dojo.toJson(this.query)+":idx:"+index+":sort:"+dojo.toJson(this.getSortProps());
var o={idty:idty,item:item};
this._by_idty[idty]=this._by_idx[index]=o;
if(!_1053){
this.updateRow(index);
}
},_onNew:function(item,_1057){
var _1058=this.attr("rowCount");
this._addingItem=true;
this.updateRowCount(_1058+1);
this._addingItem=false;
this._addItem(item,_1058);
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
},setStore:function(store,query,_105e){
this._setQuery(query,_105e);
this._setStore(store);
this._refresh(true);
},setQuery:function(query,_1060){
this._setQuery(query,_1060);
this._refresh(true);
},setItems:function(items){
this.items=items;
this._setStore(this.store);
this._refresh(true);
},_setQuery:function(query,_1063){
this.query=query;
this.queryOptions=_1063||this.queryOptions;
},_setStore:function(store){
if(this.store&&this._store_connects){
dojo.forEach(this._store_connects,function(arr){
dojo.forEach(arr,dojo.disconnect);
});
}
this.store=store;
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
},_onFetchComplete:function(items,req){
if(items&&items.length>0){
dojo.forEach(items,function(item,idx){
this._addItem(item,req.start+idx,true);
},this);
this.updateRows(req.start,items.length);
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
if(!items||!items.length){
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
},_fetch:function(start,_1073){
var start=start||0;
if(this.store&&!this._pending_requests[start]){
if(!this._isLoaded&&!this._isLoading){
this._isLoading=true;
this.showMessage(this.loadingMessage);
}
this._pending_requests[start]=true;
try{
if(this.items){
var items=this.items;
var store=this.store;
this.rowsPerPage=items.length;
var req={start:start,count:this.rowsPerPage,isRender:_1073};
this._onFetchBegin(items.length,req);
var _1077=0;
dojo.forEach(items,function(i){
if(!store.isItemLoaded(i)){
_1077++;
}
});
if(_1077===0){
this._onFetchComplete(items,req);
}else{
var _1079=function(item){
_1077--;
if(_1077===0){
this._onFetchComplete(items,req);
}
};
dojo.forEach(items,function(i){
if(!store.isItemLoaded(i)){
store.loadItem({item:i,onItem:_1079,scope:this});
}
},this);
}
}else{
this.store.fetch({start:start,count:this.rowsPerPage,query:this.query,sort:this.getSortProps(),queryOptions:this.queryOptions,isRender:_1073,onBegin:dojo.hitch(this,"_onFetchBegin"),onComplete:dojo.hitch(this,"_onFetchComplete"),onError:dojo.hitch(this,"_onFetchError")});
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
},_getItemIndex:function(item,_1080){
if(!_1080&&!this.store.isItem(item)){
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
},filter:function(query,_1086){
this.query=query;
if(_1086){
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
},_requestsPending:function(_108a){
return this._pending_requests[_108a];
},_rowToPage:function(_108b){
return (this.rowsPerPage?Math.floor(_108b/this.rowsPerPage):_108b);
},_pageToRow:function(_108c){
return (this.rowsPerPage?this.rowsPerPage*_108c:_108c);
},_preparePage:function(_108d){
if((_108d<this._bop||_108d>=this._eop)&&!this._addingItem){
var _108e=this._rowToPage(_108d);
this._needPage(_108e);
this._bop=_108e*this.rowsPerPage;
this._eop=this._bop+(this.rowsPerPage||this.attr("rowCount"));
}
},_needPage:function(_108f){
if(!this._pages[_108f]){
this._pages[_108f]=true;
this._requestPage(_108f);
}
},_requestPage:function(_1090){
var row=this._pageToRow(_1090);
var count=Math.min(this.rowsPerPage,this.attr("rowCount")-row);
if(count>0){
this._requests++;
if(!this._requestsPending(row)){
setTimeout(dojo.hitch(this,"_fetch",row,false),1);
}
}
},getCellName:function(_1093){
return _1093.field;
},_refresh:function(_1094){
this._clearData();
this._fetch(0,_1094);
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
},styleRowState:function(inRow){
if(this.store&&this.store.getState){
var _1099=this.store.getState(inRow.index),c="";
for(var i=0,ss=["inflight","error","inserting"],s;s=ss[i];i++){
if(_1099[s]){
c=" dojoxGridRow-"+s;
break;
}
}
inRow.customClasses+=c;
}
},onStyleRow:function(inRow){
this.styleRowState(inRow);
this.inherited(arguments);
},canEdit:function(_109f,_10a0){
return this._canEdit;
},_copyAttr:function(idx,attr){
var row={};
var _10a4={};
var src=this.getItem(idx);
return this.store.getValue(src,attr);
},doStartEdit:function(_10a6,_10a7){
if(!this._cache[_10a7]){
this._cache[_10a7]=this._copyAttr(_10a7,_10a6.field);
}
this.onStartEdit(_10a6,_10a7);
},doApplyCellEdit:function(_10a8,_10a9,_10aa){
this.store.fetchItemByIdentity({identity:this._by_idx[_10a9].idty,onItem:dojo.hitch(this,function(item){
var _10ac=this.store.getValue(item,_10aa);
if(typeof _10ac=="number"){
_10a8=isNaN(_10a8)?_10a8:parseFloat(_10a8);
}else{
if(typeof _10ac=="boolean"){
_10a8=_10a8=="true"?true:_10a8=="false"?false:_10a8;
}else{
if(_10ac instanceof Date){
var _10ad=new Date(_10a8);
_10a8=isNaN(_10ad.getTime())?_10a8:_10ad;
}
}
}
this.store.setValue(item,_10aa,_10a8);
this.onApplyCellEdit(_10a8,_10a9,_10aa);
})});
},doCancelEdit:function(_10ae){
var cache=this._cache[_10ae];
if(cache){
this.updateRow(_10ae);
delete this._cache[_10ae];
}
this.onCancelEdit.apply(this,arguments);
},doApplyEdit:function(_10b0,_10b1){
var cache=this._cache[_10b0];
this.onApplyEdit(_10b0);
},removeSelectedRows:function(){
if(this._canEdit){
this.edit.apply();
var items=this.selection.getSelected();
if(items.length){
dojo.forEach(items,this.store.deleteItem,this.store);
this.selection.clear();
}
}
}});
dojox.grid.DataGrid.markupFactory=function(props,node,ctor,_10b7){
return dojox.grid._Grid.markupFactory(props,node,ctor,function(node,_10b9){
var field=dojo.trim(dojo.attr(node,"field")||"");
if(field){
_10b9.field=field;
}
_10b9.field=_10b9.field||_10b9.name;
if(_10b7){
_10b7(node,_10b9);
}
});
};
}
if(!dojo._hasResource["dijit.form._Spinner"]){
dojo._hasResource["dijit.form._Spinner"]=true;
dojo.provide("dijit.form._Spinner");
dojo.declare("dijit.form._Spinner",dijit.form.RangeBoundTextBox,{defaultTimeout:500,timeoutChangeRate:0.9,smallDelta:1,largeDelta:10,templateString:"<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\r\n\tid=\"widget_${id}\"\r\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\" waiRole=\"presentation\"\r\n\t><div class=\"dijitInputLayoutContainer\"\r\n\t\t><div class=\"dijitReset dijitSpinnerButtonContainer\"\r\n\t\t\t>&nbsp;<div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitUpArrowButton\"\r\n\t\t\t\tdojoAttachPoint=\"upArrowNode\"\r\n\t\t\t\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\t\tstateModifier=\"UpArrow\"\r\n\t\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\r\n\t\t\t\t><div class=\"dijitArrowButtonChar\">&#9650;</div\r\n\t\t\t></div\r\n\t\t\t><div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitDownArrowButton\"\r\n\t\t\t\tdojoAttachPoint=\"downArrowNode\"\r\n\t\t\t\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\t\tstateModifier=\"DownArrow\"\r\n\t\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\r\n\t\t\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div\r\n\t\t\t></div\r\n\t\t></div\r\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\r\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\r\n\t\t><div class=\"dijitReset dijitInputField\"\r\n\t\t\t><input class='dijitReset' dojoAttachPoint=\"textbox,focusNode\" type=\"${type}\" dojoAttachEvent=\"onkeypress:_onKeyPress\"\r\n\t\t\t\twaiRole=\"spinbutton\" autocomplete=\"off\" ${nameAttrSetting}\r\n\t\t/></div\r\n\t></div\r\n></div>\r\n",baseClass:"dijitSpinner",adjust:function(val,delta){
return val;
},_arrowState:function(node,_10be){
this._active=_10be;
this.stateModifier=node.getAttribute("stateModifier")||"";
this._setStateClass();
},_arrowPressed:function(_10bf,_10c0,_10c1){
if(this.disabled||this.readOnly){
return;
}
this._arrowState(_10bf,true);
this._setValueAttr(this.adjust(this.attr("value"),_10c0*_10c1),false);
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
var _10ca=evt.detail?(evt.detail*-1):(evt.wheelDelta/120);
if(_10ca!==0){
var node=this[(_10ca>0?"upArrowNode":"downArrowNode")];
this._arrowPressed(node,_10ca,this.smallDelta);
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
var _10cf=this.format(val,this.constraints);
if(_10cf!==undefined){
this.textbox.value=_10cf;
}
}
this.inherited(arguments);
},format:function(value,_10d1){
if(typeof value!="number"){
return String(value);
}
if(isNaN(value)){
return "";
}
if(("rangeCheck" in this)&&!this.rangeCheck(value,_10d1)){
return String(value);
}
if(this.editOptions&&this._focused){
_10d1=dojo.mixin(dojo.mixin({},this.editOptions),_10d1);
}
return this._formatter(value,_10d1);
},parse:dojo.number.parse,_getDisplayedValueAttr:function(){
var v=this.inherited(arguments);
return isNaN(v)?this.textbox.value:v;
},filter:function(value){
return (value===null||value===""||value===undefined)?NaN:this.inherited(arguments);
},serialize:function(value,_10d5){
return (typeof value!="number"||isNaN(value))?"":this.inherited(arguments);
},_setValueAttr:function(value,_10d7,_10d8){
if(value!==undefined&&_10d8===undefined){
if(typeof value=="number"){
if(isNaN(value)){
_10d8="";
}else{
if(("rangeCheck" in this)&&!this.rangeCheck(value,this.constraints)){
_10d8=String(value);
}
}
}else{
if(!value){
_10d8="";
value=NaN;
}else{
_10d8=String(value);
value=undefined;
}
}
}
this.inherited(arguments,[value,_10d7,_10d8]);
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
var tc=this.constraints,v=isNaN(val),_10df=!isNaN(tc.max),_10e0=!isNaN(tc.min);
if(v&&delta!=0){
val=(delta>0)?_10e0?tc.min:_10df?tc.max:0:_10df?this.constraints.max:_10e0?tc.min:0;
}
var _10e1=val+delta;
if(v||isNaN(_10e1)){
return val;
}
if(_10df&&(_10e1>tc.max)){
_10e1=tc.max;
}
if(_10e0&&(_10e1<tc.min)){
_10e1=tc.min;
}
return _10e1;
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
var _10e5={ADP:0,BHD:3,BIF:0,BYR:0,CLF:0,CLP:0,DJF:0,ESP:0,GNF:0,IQD:3,ITL:0,JOD:3,JPY:0,KMF:0,KRW:0,KWD:3,LUF:0,LYD:3,MGA:0,MGF:0,OMR:3,PYG:0,RWF:0,TND:3,TRL:0,VUV:0,XAF:0,XOF:0,XPF:0};
var _10e6={CHF:5};
var _10e7=_10e5[code],round=_10e6[code];
if(typeof _10e7=="undefined"){
_10e7=2;
}
if(typeof round=="undefined"){
round=0;
}
return {places:_10e7,round:round};
};
}
if(!dojo._hasResource["dojo.currency"]){
dojo._hasResource["dojo.currency"]=true;
dojo.provide("dojo.currency");
dojo.currency._mixInDefaults=function(_10e9){
_10e9=_10e9||{};
_10e9.type="currency";
var _10ea=dojo.i18n.getLocalization("dojo.cldr","currency",_10e9.locale)||{};
var iso=_10e9.currency;
var data=dojo.cldr.monetary.getData(iso);
dojo.forEach(["displayName","symbol","group","decimal"],function(prop){
data[prop]=_10ea[iso+"_"+prop];
});
data.fractional=[true,false];
return dojo.mixin(data,_10e9);
};
dojo.currency.format=function(value,_10ef){
return dojo.number.format(value,dojo.currency._mixInDefaults(_10ef));
};
dojo.currency.regexp=function(_10f0){
return dojo.number.regexp(dojo.currency._mixInDefaults(_10f0));
};
dojo.currency.parse=function(_10f1,_10f2){
return dojo.number.parse(_10f1,dojo.currency._mixInDefaults(_10f2));
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
var _10f6=dojo.coords(this.sliderBarContainer,true);
var _10f7=e[this._mousePixelCoord]-_10f6[this._startingPixelCoord];
this._setPixelValue(this._isReversed()?(_10f6[this._pixelCount]-_10f7):_10f7,_10f6[this._pixelCount],true);
this._movable.onMouseDown(e);
},_setPixelValue:function(_10f8,_10f9,_10fa){
if(this.disabled||this.readOnly){
return;
}
_10f8=_10f8<0?0:_10f9<_10f8?_10f9:_10f8;
var count=this.discreteValues;
if(count<=1||count==Infinity){
count=_10f9;
}
count--;
var _10fc=_10f9/count;
var _10fd=Math.round(_10f8/_10fc);
this._setValueAttr((this.maximum-this.minimum)*_10fd/count+this.minimum,_10fa);
},_setValueAttr:function(value,_10ff){
this.valueNode.value=this.value=value;
dijit.setWaiState(this.focusNode,"valuenow",value);
this.inherited(arguments);
var _1100=(value-this.minimum)/(this.maximum-this.minimum);
var _1101=(this._descending===false)?this.remainingBar:this.progressBar;
var _1102=(this._descending===false)?this.progressBar:this.remainingBar;
if(this._inProgressAnim&&this._inProgressAnim.status!="stopped"){
this._inProgressAnim.stop(true);
}
if(_10ff&&this.slideDuration>0&&_1101.style[this._progressPixelSize]){
var _this=this;
var props={};
var start=parseFloat(_1101.style[this._progressPixelSize]);
var _1106=this.slideDuration*(_1100-start/100);
if(_1106==0){
return;
}
if(_1106<0){
_1106=0-_1106;
}
props[this._progressPixelSize]={start:start,end:_1100*100,units:"%"};
this._inProgressAnim=dojo.animateProperty({node:_1101,duration:_1106,onAnimate:function(v){
_1102.style[_this._progressPixelSize]=(100-parseFloat(v[_this._progressPixelSize]))+"%";
},onEnd:function(){
delete _this._inProgressAnim;
},properties:props});
this._inProgressAnim.play();
}else{
_1101.style[this._progressPixelSize]=(_1100*100)+"%";
_1102.style[this._progressPixelSize]=((1-_1100)*100)+"%";
}
},_bumpValue:function(_1108){
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
var value=(this.value-this.minimum)*count/(this.maximum-this.minimum)+_1108;
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
var _1112=evt[(janky?"wheelDelta":"detail")]*(janky?1:-1);
this[(_1112<0?"decrement":"increment")](evt);
},startup:function(){
dojo.forEach(this.getChildren(),function(child){
if(this[child.container]!=this.containerNode){
this[child.container].appendChild(child.domNode);
}
},this);
},_typematicCallback:function(count,_1115,e){
if(count==-1){
return;
}
this[(_1115==(this._descending?this.incrementButton:this.decrementButton))?"decrement":"increment"](e);
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
var _111b=this.widget;
var _111c=_111b._abspos;
if(!_111c){
_111c=_111b._abspos=dojo.coords(_111b.sliderBarContainer,true);
_111b._setPixelValue_=dojo.hitch(_111b,"_setPixelValue");
_111b._isReversed_=_111b._isReversed();
}
var _111d=e[_111b._mousePixelCoord]-_111c[_111b._startingPixelCoord];
_111b._setPixelValue_(_111b._isReversed_?(_111c[_111b._pixelCount]-_111d):_111d,_111c[_111b._pixelCount],false);
},destroy:function(e){
dojo.dnd.Mover.prototype.destroy.apply(this,arguments);
var _111f=this.widget;
_111f._abspos=null;
_111f._setValueAttr(_111f.value,true);
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
var _1122=oSel.getRangeAt(0);
if((_1122.startContainer==_1122.endContainer)&&((_1122.endOffset-_1122.startOffset)==1)&&(_1122.startContainer.nodeType!=3)){
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
var _1123=dojo.global.getSelection();
if(_1123){
return _1123.toString();
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
var _1124=dojo.global.getSelection();
if(_1124&&_1124.rangeCount){
var frag=_1124.getRangeAt(0).cloneContents();
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
var _1128=dojo.global.getSelection();
return _1128.anchorNode.childNodes[_1128.anchorOffset];
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
var _112b=dojo.global.getSelection();
if(_112b){
var node=_112b.anchorNode;
while(node&&(node.nodeType!=1)){
node=node.parentNode;
}
return node;
}
}
}
return null;
},hasAncestorElement:function(_112d){
return this.getAncestorElement.apply(this,arguments)!=null;
},getAncestorElement:function(_112e){
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
},collapse:function(_1137){
if(window["getSelection"]){
var _1138=dojo.global.getSelection();
if(_1138.removeAllRanges){
if(_1137){
_1138.collapseToStart();
}else{
_1138.collapseToEnd();
}
}else{
_1138.collapse(_1137);
}
}else{
if(dojo.doc.selection){
var range=dojo.doc.selection.createRange();
range.collapse(_1137);
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
},selectElementChildren:function(_113b,_113c){
var _113d=dojo.global;
var _113e=dojo.doc;
_113b=dojo.byId(_113b);
if(_113e.selection&&dojo.body().createTextRange){
var range=_113b.ownerDocument.body.createTextRange();
range.moveToElementText(_113b);
if(!_113c){
try{
range.select();
}
catch(e){
}
}
}else{
if(_113d.getSelection){
var _1140=_113d.getSelection();
if(_1140.setBaseAndExtent){
_1140.setBaseAndExtent(_113b,0,_113b,_113b.innerText.length-1);
}else{
if(_1140.selectAllChildren){
_1140.selectAllChildren(_113b);
}
}
}
}
},selectElement:function(_1141,_1142){
var range,_1144=dojo.doc;
_1141=dojo.byId(_1141);
if(_1144.selection&&dojo.body().createTextRange){
try{
range=dojo.body().createControlRange();
range.addElement(_1141);
if(!_1142){
range.select();
}
}
catch(e){
this.selectElementChildren(_1141,_1142);
}
}else{
if(dojo.global.getSelection){
var _1145=dojo.global.getSelection();
if(_1145.removeAllRanges){
range=_1144.createRange();
range.selectNode(_1141);
_1145.removeAllRanges();
_1145.addRange(range);
}
}
}
}});
}
if(!dojo._hasResource["dijit._editor.range"]){
dojo._hasResource["dijit._editor.range"]=true;
dojo.provide("dijit._editor.range");
dijit.range={};
dijit.range.getIndex=function(node,_1147){
var ret=[],retR=[];
var stop=_1147;
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
dijit.range.getNode=function(index,_1150){
if(!dojo.isArray(index)||index.length==0){
return _1150;
}
var node=_1150;
dojo.every(index,function(i){
if(i>=0&&i<node.childNodes.length){
node=node.childNodes[i];
}else{
node=null;
console.debug("Error: can not find node with index",index,"under parent node",_1150);
return false;
}
return true;
});
return node;
};
dijit.range.getCommonAncestor=function(n1,n2){
var _1155=function(n){
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
var n1as=_1155(n1);
var n2as=_1155(n2);
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
var block=null,_1165;
while(node&&node!==root){
var name=node.nodeName.toUpperCase();
if(!block&&regex.test(name)){
block=node;
}
if(!_1165&&(/^(?:BODY|TD|TH|CAPTION)$/).test(name)){
_1165=node;
}
node=node.parentNode;
}
return {blockNode:block,blockContainer:_1165||node.ownerDocument.body};
};
dijit.range.atBeginningOfContainer=function(_1167,node,_1169){
var _116a=false;
var _116b=(_1169==0);
if(!_116b&&node.nodeType==3){
if(dojo.trim(node.nodeValue.substr(0,_1169))==0){
_116b=true;
}
}
if(_116b){
var cnode=node;
_116a=true;
while(cnode&&cnode!==_1167){
if(cnode.previousSibling){
_116a=false;
break;
}
cnode=cnode.parentNode;
}
}
return _116a;
};
dijit.range.atEndOfContainer=function(_116d,node,_116f){
var atEnd=false;
var _1171=(_116f==(node.length||node.childNodes.length));
if(!_1171&&node.nodeType==3){
if(dojo.trim(node.nodeValue.substr(_116f))==0){
_1171=true;
}
}
if(_1171){
var cnode=node;
atEnd=true;
while(cnode&&cnode!==_116d){
if(cnode.nextSibling){
atEnd=false;
break;
}
cnode=cnode.parentNode;
}
}
return atEnd;
};
dijit.range.adjacentNoneTextNode=function(_1173,next){
var node=_1173;
var len=(0-_1173.length)||0;
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
dijit.range.getSelection=function(win,_1179){
if(dijit.range._w3c){
return win.getSelection();
}else{
var s=new dijit.range.ie.selection(win);
if(!_1179){
s._getCurrentSelection();
}
return s;
}
};
if(!dijit.range._w3c){
dijit.range.ie={cachedSelection:{},selection:function(win){
this._ranges=[];
this.addRange=function(r,_117d){
this._ranges.push(r);
if(!_117d){
r._select();
}
this.rangeCount=this._ranges.length;
};
this.removeAllRanges=function(){
this._ranges=[];
this.rangeCount=0;
};
var _117e=function(){
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
var r=_117e();
if(r){
this.addRange(r,true);
}
};
},decomposeControlRange:function(range){
var _1184=range.item(0),_1185=range.item(range.length-1);
var _1186=_1184.parentNode,_1187=_1185.parentNode;
var _1188=dijit.range.getIndex(_1184,_1186).o;
var _1189=dijit.range.getIndex(_1185,_1187).o+1;
return [_1186,_1188,_1187,_1189];
},getEndPoint:function(range,end){
var _118c=range.duplicate();
_118c.collapse(!end);
var _118d="EndTo"+(end?"End":"Start");
var _118e=_118c.parentElement();
var _118f,_1190,_1191;
if(_118e.childNodes.length>0){
dojo.every(_118e.childNodes,function(node,i){
var _1194;
if(node.nodeType!=3){
_118c.moveToElementText(node);
if(_118c.compareEndPoints(_118d,range)>0){
_118f=node.previousSibling;
if(_1191&&_1191.nodeType==3){
_118f=_1191;
_1194=true;
}else{
_118f=_118e;
_1190=i;
return false;
}
}else{
if(i==_118e.childNodes.length-1){
_118f=_118e;
_1190=_118e.childNodes.length;
return false;
}
}
}else{
if(i==_118e.childNodes.length-1){
_118f=node;
_1194=true;
}
}
if(_1194&&_118f){
var _1195=dijit.range.adjacentNoneTextNode(_118f)[0];
if(_1195){
_118f=_1195.nextSibling;
}else{
_118f=_118e.firstChild;
}
var _1196=dijit.range.adjacentNoneTextNode(_118f);
_1195=_1196[0];
var _1197=_1196[1];
if(_1195){
_118c.moveToElementText(_1195);
_118c.collapse(false);
}else{
_118c.moveToElementText(_118e);
}
_118c.setEndPoint(_118d,range);
_1190=_118c.text.length-_1197;
return false;
}
_1191=node;
return true;
});
}else{
_118f=_118e;
_1190=0;
}
if(!end&&_118f.nodeType!=3&&_1190==_118f.childNodes.length){
if(_118f.nextSibling&&_118f.nextSibling.nodeType==3){
_118f=_118f.nextSibling;
_1190=0;
}
}
return [_118f,_1190];
},setEndPoint:function(range,_1199,_119a){
var _119b=range.duplicate(),node,len;
if(_1199.nodeType!=3){
if(_119a>0){
node=_1199.childNodes[_119a-1];
if(node.nodeType==3){
_1199=node;
_119a=node.length;
}else{
if(node.nextSibling&&node.nextSibling.nodeType==3){
_1199=node.nextSibling;
_119a=0;
}else{
_119b.moveToElementText(node.nextSibling?node:_1199);
var _119e=node.parentNode.insertBefore(document.createTextNode(" "),node.nextSibling);
_119b.collapse(false);
_119e.parentNode.removeChild(_119e);
}
}
}else{
_119b.moveToElementText(_1199);
_119b.collapse(true);
}
}
if(_1199.nodeType==3){
var _119f=dijit.range.adjacentNoneTextNode(_1199);
var _11a0=_119f[0];
len=_119f[1];
if(_11a0){
_119b.moveToElementText(_11a0);
_119b.collapse(false);
if(_11a0.contentEditable!="inherit"){
len++;
}
}else{
_119b.moveToElementText(_1199.parentNode);
_119b.collapse(true);
}
_119a+=len;
if(_119a>0){
if(_119b.move("character",_119a)!=_119a){
console.error("Error when moving!");
}
}
}
return _119b;
},decomposeTextRange:function(range){
var _11a2=dijit.range.ie.getEndPoint(range);
var _11a3=_11a2[0],_11a4=_11a2[1];
var _11a5=_11a2[0],_11a6=_11a2[1];
if(range.htmlText.length){
if(range.htmlText==range.text){
_11a6=_11a4+range.text.length;
}else{
_11a2=dijit.range.ie.getEndPoint(range,true);
_11a5=_11a2[0],_11a6=_11a2[1];
}
}
return [_11a3,_11a4,_11a5,_11a6];
},setRange:function(range,_11a8,_11a9,_11aa,_11ab,_11ac){
var start=dijit.range.ie.setEndPoint(range,_11a8,_11a9);
range.setEndPoint("StartToStart",start);
if(!_11ac){
var end=dijit.range.ie.setEndPoint(range,_11aa,_11ab);
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
},setStart:function(node,_11b0){
_11b0=parseInt(_11b0);
if(this.startContainer===node&&this.startOffset==_11b0){
return;
}
delete this._cachedBookmark;
this.startContainer=node;
this.startOffset=_11b0;
if(!this.endContainer){
this.setEnd(node,_11b0);
}else{
this._updateInternal();
}
},setEnd:function(node,_11b2){
_11b2=parseInt(_11b2);
if(this.endContainer===node&&this.endOffset==_11b2){
return;
}
delete this._cachedBookmark;
this.endContainer=node;
this.endOffset=_11b2;
if(!this.startContainer){
this.setStart(node,_11b2);
}else{
this._updateInternal();
}
},setStartAfter:function(node,_11b4){
this._setPoint("setStart",node,_11b4,1);
},setStartBefore:function(node,_11b6){
this._setPoint("setStart",node,_11b6,0);
},setEndAfter:function(node,_11b8){
this._setPoint("setEnd",node,_11b8,1);
},setEndBefore:function(node,_11ba){
this._setPoint("setEnd",node,_11ba,0);
},_setPoint:function(what,node,_11bd,ext){
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
dijit._editor.escapeXml=function(str,_11c6){
str=str.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
if(!_11c6){
str=str.replace(/'/gm,"&#39;");
}
return str;
};
dijit._editor.getNodeHtml=function(node){
var _11c8;
switch(node.nodeType){
case 1:
_11c8="<"+node.nodeName.toLowerCase();
var _11c9=[];
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
_11c9.push([key,node.getAttribute("_djrealurl")]);
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
_11c9.push([key,val.toString()]);
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
_11c9.push([n,v]);
}
}
}
_11c9.sort(function(a,b){
return a[0]<b[0]?-1:(a[0]==b[0]?0:1);
});
var j=0;
while((attr=_11c9[j++])){
_11c8+=" "+attr[0]+"=\""+(dojo.isString(attr[1])?dijit._editor.escapeXml(attr[1],true):attr[1])+"\"";
}
if(node.childNodes.length){
_11c8+=">"+dijit._editor.getChildrenHtml(node)+"</"+node.nodeName.toLowerCase()+">";
}else{
_11c8+=" />";
}
break;
case 3:
_11c8=dijit._editor.escapeXml(node.nodeValue,true);
break;
case 8:
_11c8="<!--"+dijit._editor.escapeXml(node.nodeValue,true)+"-->";
break;
default:
_11c8="<!-- Element not recognized - Type: "+node.nodeType+" Name: "+node.nodeName+"-->";
}
return _11c8;
};
dijit._editor.getChildrenHtml=function(dom){
var out="";
if(!dom){
return out;
}
var nodes=dom["childNodes"]||dom;
var _11d9=!dojo.isIE||nodes!==dom;
var node,i=0;
while((node=nodes[i++])){
if(!_11d9||node.parentNode==dom){
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
var _11dc=dojo.doc.createElement("textarea");
_11dc.id=dijit._scopeName+"._editor.RichText.savedContent";
dojo.style(_11dc,{display:"none",position:"absolute",top:"-100px",height:"3px",width:"3px"});
dojo.body().appendChild(_11dc);
})();
}else{
try{
dojo.doc.write("<textarea id=\""+dijit._scopeName+"._editor.RichText.savedContent\" "+"style=\"display:none;position:absolute;top:-100px;left:-100px;height:3px;width:3px;overflow:hidden;\"></textarea>");
}
catch(e){
}
}
}
dojo.declare("dijit._editor.RichText",dijit._Widget,{constructor:function(_11dd){
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
var _11e1={b:exec("bold"),i:exec("italic"),u:exec("underline"),a:exec("selectall"),s:function(){
this.save(true);
},m:function(){
this.isTabIndent=!this.isTabIndent;
},"1":exec("formatblock","h1"),"2":exec("formatblock","h2"),"3":exec("formatblock","h3"),"4":exec("formatblock","h4"),"\\":exec("insertunorderedlist")};
if(!dojo.isIE){
_11e1.Z=exec("redo");
}
for(var key in _11e1){
this.addKeyHandler(key,true,false,_11e1[key]);
}
},events:["onKeyPress","onKeyDown","onKeyUp","onClick"],captureEvents:[],_editorCommandsLocalized:false,_localizeEditorCommands:function(){
if(this._editorCommandsLocalized){
return;
}
this._editorCommandsLocalized=true;
var _11e3=["div","p","pre","h1","h2","h3","h4","h5","h6","ol","ul","address"];
var _11e4="",_11e5,i=0;
while((_11e5=_11e3[i++])){
if(_11e5.charAt(1)!="l"){
_11e4+="<"+_11e5+"><span>content</span></"+_11e5+"><br/>";
}else{
_11e4+="<"+_11e5+"><li>content</li></"+_11e5+"><br/>";
}
}
var div=dojo.doc.createElement("div");
dojo.style(div,{position:"absolute",top:"-2000px"});
dojo.doc.body.appendChild(div);
div.innerHTML=_11e4;
var node=div.firstChild;
while(node){
dijit._editor.selection.selectElement(node.firstChild);
dojo.withGlobal(this.window,"selectElement",dijit._editor.selection,[node.firstChild]);
var _11e9=node.tagName.toLowerCase();
this._local2NativeFormatNames[_11e9]=document.queryCommandValue("formatblock");
this._native2LocalFormatNames[this._local2NativeFormatNames[_11e9]]=_11e9;
node=node.nextSibling.nextSibling;
}
dojo.body().removeChild(div);
},open:function(_11ea){
if(!this.onLoadDeferred||this.onLoadDeferred.fired>=0){
this.onLoadDeferred=new dojo.Deferred();
}
if(!this.isClosed){
this.close();
}
dojo.publish(dijit._scopeName+"._editor.RichText::open",[this]);
this._content="";
if(arguments.length==1&&_11ea.nodeName){
this.domNode=_11ea;
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
var _11ee=dojo.hitch(this,function(){
dojo.style(ta,{display:"block",position:"absolute",top:"-1000px"});
if(dojo.isIE){
var s=ta.style;
this.__overflow=s.overflow;
s.overflow="hidden";
}
});
if(dojo.isIE){
setTimeout(_11ee,10);
}else{
_11ee();
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
var _11f0=dojo.contentBox(dn);
this._oldHeight=_11f0.h;
this._oldWidth=_11f0.w;
this.savedContent=html;
if(dn.nodeName&&dn.nodeName=="LI"){
dn.innerHTML=" <br>";
}
this.editingArea=dn.ownerDocument.createElement("div");
dn.appendChild(this.editingArea);
if(this.name!=""&&(!dojo.config["useXDomain"]||dojo.config["allowXdRichTextSave"])){
var _11f1=dojo.byId(dijit._scopeName+"._editor.RichText.savedContent");
if(_11f1.value!=""){
var datas=_11f1.value.split(this._SEPARATOR),i=0,dat;
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
var _11fc=_cs.lineHeight;
if(_11fc.indexOf("px")>=0){
_11fc=parseFloat(_11fc)/parseFloat(_cs.fontSize);
}else{
if(_11fc.indexOf("em")>=0){
_11fc=parseFloat(_11fc);
}else{
_11fc="1.0";
}
}
var _11fd="";
this.style.replace(/(^|;)(line-|font-?)[^;]+/g,function(match){
_11fd+=match.replace(/^;/g,"")+";";
});
var d=dojo.doc;
var _1200=d.charset||d.characterSet||d.defaultCharset||"UTF-8";
return [this.isLeftToRight()?"<html><head>":"<html dir='rtl'><head>",(dojo.isMoz?"<title>"+this._localizedIframeTitles.iframeEditTitle+"</title>":""),"<meta http-equiv='Content-Type' content='text/html; charset="+_1200+"'>","<style>","body,html {","\tbackground:transparent;","\tpadding: 1em 0 0 0;","\tmargin: -1em 0 0 0;","}","body{","\ttop:0px; left:0px; right:0px;","\tfont:",font,";",((this.height||dojo.isOpera)?"":"position: fixed;"),"\tmin-height:",this.minHeight,";","\tline-height:",_11fc,"}","p{ margin: 1em 0 !important; }",(this.height?"":"body,html{overflow-y:hidden;/*for IE*/} body > div {overflow-x:auto;/*FF:horizontal scrollbar*/ overflow-y:hidden;/*safari*/ min-height:"+this.minHeight+";/*safari*/}"),"li > ul:-moz-first-node, li > ol:-moz-first-node{ padding-top: 1.2em; } ","li{ min-height:1.2em; }","</style>",this._applyEditingAreaStyleSheets(),"</head><body onload='frameElement._loadFunc(window,document)' style='"+_11fd+"'>"+html+"</body></html>"].join("");
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
var _1206;
if(this.textarea){
_1206=this.srcNodeRef;
}else{
_1206=dojo.doc.createElement("div");
_1206.style.display="none";
_1206.innerHTML=html;
this.editingArea.appendChild(_1206);
}
this.editingArea.appendChild(this.iframe);
var _1207=dojo.hitch(this,function(){
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
setTimeout(_1207,50);
return;
}
var _1208=this.document;
_1208.open();
if(dojo.isAIR){
_1208.body.innerHTML=html;
}else{
_1208.write(this._getIframeDocTxt(html));
}
_1208.close();
dojo.destroy(_1206);
}
if(!this.document.body){
setTimeout(_1207,50);
return;
}
this.onLoad();
}else{
dojo.destroy(_1206);
this.editNode.innerHTML=html;
this.onDisplayChanged();
}
this._preDomFilterContent(this.editNode);
});
_1207();
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
var _120d=(new dojo._Url(dojo.global.location,url)).toString();
this.editingAreaStyleSheets.push(_120d);
text+="<link rel=\"stylesheet\" type=\"text/css\" href=\""+_120d+"\"/>";
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
var _1211=this.document.createElement("link");
_1211.rel="stylesheet";
_1211.type="text/css";
_1211.href=url;
head.appendChild(_1211);
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
var _1216=dojo.isIE&&(this.isLoaded||!this.focusOnLoad);
if(_1216){
this.editNode.unselectable="on";
}
this.editNode.contentEditable=!value;
if(_1216){
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
var _121c=(this.tabStop=dojo.doc.createElement("<div tabIndex=-1>"));
this.editingArea.appendChild(_121c);
this.iframe.onfocus=function(){
_this.editNode.setActive();
};
}
}
this.focusNode=this.editNode;
this._preDomFilterContent(this.editNode);
var _121d=this.events.concat(this.captureEvents);
var ap=this.iframe?this.document:this.editNode;
dojo.forEach(_121d,function(item){
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
var _1221=dojo.isFF<3?this.iframe.contentDocument:this.iframe;
_1221.title=this._localizedIframeTitles.iframeFocusTitle;
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
},setDisabled:function(_1223){
dojo.deprecated("dijit.Editor::setDisabled is deprecated","use dijit.Editor::attr(\"disabled\",boolean) instead",2);
this.attr("disabled",_1223);
},_setValueAttr:function(value){
this.setValue(value);
},_getDisableSpellCheckAttr:function(){
return !dojo.attr(this.document.body,"spellcheck");
},_setDisableSpellCheckAttr:function(_1225){
if(this.document){
dojo.attr(this.document.body,"spellcheck",!_1225);
}else{
this.onLoadDeferred.addCallback(dojo.hitch(this,function(){
dojo.attr(this.document.body,"spellcheck",!_1225);
}));
}
},onKeyPress:function(e){
var c=(e.keyChar&&e.keyChar.toLowerCase())||e.keyCode;
var _1228=this._keyHandlers[c];
var args=arguments;
if(_1228&&!e.altKey){
dojo.forEach(_1228,function(h){
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
},addKeyHandler:function(key,ctrl,shift,_122e){
if(!dojo.isArray(this._keyHandlers[key])){
this._keyHandlers[key]=[];
}
this._keyHandlers[key].push({shift:shift||false,ctrl:ctrl||false,handler:_122e});
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
var _1233=dojo.isFF<3?this.iframe.contentDocument:this.iframe;
_1233.title=this._localizedIframeTitles.iframeEditTitle;
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
},onChange:function(_1236){
},_normalizeCommand:function(cmd){
var _1238=cmd.toLowerCase();
if(_1238=="formatblock"){
if(dojo.isSafari){
_1238="heading";
}
}else{
if(_1238=="hilitecolor"&&!dojo.isMoz){
_1238="backcolor";
}
}
return _1238;
},_qcaCache:{},queryCommandAvailable:function(_1239){
var ca=this._qcaCache[_1239];
if(ca!=undefined){
return ca;
}
return (this._qcaCache[_1239]=this._queryCommandAvailable(_1239));
},_queryCommandAvailable:function(_123b){
var ie=1;
var _123d=1<<1;
var _123e=1<<2;
var opera=1<<3;
var _1240=1<<4;
var gt420=dojo.isWebKit;
function _1242(_1243){
return {ie:Boolean(_1243&ie),mozilla:Boolean(_1243&_123d),webkit:Boolean(_1243&_123e),webkit420:Boolean(_1243&_1240),opera:Boolean(_1243&opera)};
};
var _1244=null;
switch(_123b.toLowerCase()){
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
_1244=_1242(_123d|ie|_123e|opera);
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
_1244=_1242(_123d|ie|opera|_1240);
break;
case "blockdirltr":
case "blockdirrtl":
case "dirltr":
case "dirrtl":
case "inlinedirltr":
case "inlinedirrtl":
_1244=_1242(ie);
break;
case "cut":
case "copy":
case "paste":
_1244=_1242(ie|_123d|_1240);
break;
case "inserttable":
_1244=_1242(_123d|ie);
break;
case "insertcell":
case "insertcol":
case "insertrow":
case "deletecells":
case "deletecols":
case "deleterows":
case "mergecells":
case "splitcell":
_1244=_1242(ie|_123d);
break;
default:
return false;
}
return (dojo.isIE&&_1244.ie)||(dojo.isMoz&&_1244.mozilla)||(dojo.isWebKit&&_1244.webkit)||(dojo.isWebKit>420&&_1244.webkit420)||(dojo.isOpera&&_1244.opera);
},execCommand:function(_1245,_1246){
var _1247;
this.focus();
_1245=this._normalizeCommand(_1245);
if(_1246!=undefined){
if(_1245=="heading"){
throw new Error("unimplemented");
}else{
if((_1245=="formatblock")&&dojo.isIE){
_1246="<"+_1246+">";
}
}
}
if(_1245=="inserthtml"){
_1246=this._preFilterContent(_1246);
_1247=true;
if(dojo.isIE){
var _1248=this.document.selection.createRange();
if(this.document.selection.type.toUpperCase()=="CONTROL"){
var n=_1248.item(0);
while(_1248.length){
_1248.remove(_1248.item(0));
}
n.outerHTML=_1246;
}else{
_1248.pasteHTML(_1246);
}
_1248.select();
}else{
if(dojo.isMoz&&!_1246.length){
this._sCall("remove");
}else{
_1247=this.document.execCommand(_1245,false,_1246);
}
}
}else{
if((_1245=="unlink")&&(this.queryCommandEnabled("unlink"))&&(dojo.isMoz||dojo.isWebKit)){
var a=this._sCall("getAncestorElement",["a"]);
this._sCall("selectElement",[a]);
_1247=this.document.execCommand("unlink",false,null);
}else{
if((_1245=="hilitecolor")&&(dojo.isMoz)){
this.document.execCommand("styleWithCSS",false,true);
_1247=this.document.execCommand(_1245,false,_1246);
this.document.execCommand("styleWithCSS",false,false);
}else{
if((dojo.isIE)&&((_1245=="backcolor")||(_1245=="forecolor"))){
_1246=arguments.length>1?_1246:null;
_1247=this.document.execCommand(_1245,false,_1246);
}else{
_1246=arguments.length>1?_1246:null;
if(_1246||_1245!="createlink"){
_1247=this.document.execCommand(_1245,false,_1246);
}
}
}
}
}
this.onDisplayChanged();
return _1247;
},queryCommandEnabled:function(_124b){
if(this.disabled||!this._disabledOK){
return false;
}
_124b=this._normalizeCommand(_124b);
if(dojo.isMoz||dojo.isWebKit){
if(_124b=="unlink"){
this._sCall("hasAncestorElement",["a"]);
}else{
if(_124b=="inserttable"){
return true;
}
}
}
if(dojo.isWebKit){
if(_124b=="copy"){
_124b="cut";
}else{
if(_124b=="paste"){
return true;
}
}
}
var elem=dojo.isIE?this.document.selection.createRange():this.document;
return elem.queryCommandEnabled(_124b);
},queryCommandState:function(_124d){
if(this.disabled||!this._disabledOK){
return false;
}
_124d=this._normalizeCommand(_124d);
return this.document.queryCommandState(_124d);
},queryCommandValue:function(_124e){
if(this.disabled||!this._disabledOK){
return false;
}
var r;
_124e=this._normalizeCommand(_124e);
if(dojo.isIE&&_124e=="formatblock"){
r=this._native2LocalFormatNames[this.document.queryCommandValue(_124e)];
}else{
r=this.document.queryCommandValue(_124e);
}
return r;
},_sCall:function(name,args){
return dojo.withGlobal(this.window,name,dijit._editor.selection,args);
},placeCursorAtStart:function(){
this.focus();
var _1252=false;
if(dojo.isMoz){
var first=this.editNode.firstChild;
while(first){
if(first.nodeType==3){
if(first.nodeValue.replace(/^\s+|\s+$/g,"").length>0){
_1252=true;
this._sCall("selectElement",[first]);
break;
}
}else{
if(first.nodeType==1){
_1252=true;
this._sCall("selectElementChildren",[first]);
break;
}
}
first=first.nextSibling;
}
}else{
_1252=true;
this._sCall("selectElementChildren",[this.editNode]);
}
if(_1252){
this._sCall("collapse",[true]);
}
},placeCursorAtEnd:function(){
this.focus();
var _1254=false;
if(dojo.isMoz){
var last=this.editNode.lastChild;
while(last){
if(last.nodeType==3){
if(last.nodeValue.replace(/^\s+|\s+$/g,"").length>0){
_1254=true;
this._sCall("selectElement",[last]);
break;
}
}else{
if(last.nodeType==1){
_1254=true;
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
_1254=true;
this._sCall("selectElementChildren",[this.editNode]);
}
if(_1254){
this._sCall("collapse",[false]);
}
},getValue:function(_1256){
if(this.textarea){
if(this.isClosed||!this.isLoaded){
return this.textarea.value;
}
}
return this._postFilterContent(null,_1256);
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
},_postFilterContent:function(dom,_1260){
var ec;
if(!dojo.isString(dom)){
dom=dom||this.editNode;
if(this.contentDomPostFilters.length){
if(_1260){
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
var _1265=dojo.byId(dijit._scopeName+"._editor.RichText.savedContent");
_1265.value+=this._SEPARATOR+this.name+":"+this.getValue();
},escapeXml:function(str,_1267){
str=str.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
if(!_1267){
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
var _126c=(this.savedContent!=this._content);
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
return _126c;
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
var _1277=this.iconClassPrefix+" "+this.iconClassPrefix+this.command.charAt(0).toUpperCase()+this.command.substr(1);
if(!this.button){
props=dojo.mixin({label:label,showLabel:false,iconClass:_1277,dropDown:this.dropDown,tabIndex:"-1"},props||{});
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
var e=this.editor,c=this.command,_127e,_127f;
if(!e||!e.isLoaded||!c.length){
return;
}
if(this.button){
try{
_127f=e.queryCommandEnabled(c);
if(this.enabled!==_127f){
this.enabled=_127f;
this.button.attr("disabled",!_127f);
}
if(typeof this.button.checked=="boolean"){
_127e=e.queryCommandState(c);
if(this.checked!==_127e){
this.checked=_127e;
this.button.attr("checked",e.queryCommandState(c));
}
}
}
catch(e){
console.log(e);
}
}
},setEditor:function(_1280){
this.editor=_1280;
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
},setToolbar:function(_1281){
if(this.button){
_1281.addChild(this.button);
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
},setEditor:function(_1283){
this.editor=_1283;
if(this.blockNodeForEnter=="BR"){
if(dojo.isIE){
_1283.contentDomPreFilters.push(dojo.hitch(this,"regularPsToSingleLinePs"));
_1283.contentDomPostFilters.push(dojo.hitch(this,"singleLinePsToRegularPs"));
_1283.onLoadDeferred.addCallback(dojo.hitch(this,"_fixNewLineBehaviorForIE"));
}else{
_1283.onLoadDeferred.addCallback(dojo.hitch(this,function(d){
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
_1283.addKeyHandler(13,0,0,h);
_1283.addKeyHandler(13,0,1,h);
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
var _128a=dojo.withGlobal(this.editor.window,"getAncestorElement",dijit._editor.selection,["LI"]);
if(!_128a){
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
if(_128a.parentNode.parentNode.nodeName=="LI"){
_128a=_128a.parentNode.parentNode;
}
}
var fc=_128a.firstChild;
if(fc&&fc.nodeType==1&&(fc.nodeName=="UL"||fc.nodeName=="OL")){
_128a.insertBefore(fc.ownerDocument.createTextNode(" "),fc);
var _128e=dijit.range.create();
_128e.setStart(_128a.firstChild,0);
var _128f=dijit.range.getSelection(this.editor.window,true);
_128f.removeAllRanges();
_128f.addRange(_128e);
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
var _1291,range,_1293,doc=this.editor.document,br;
if(e.shiftKey||this.blockNodeForEnter=="BR"){
var _1296=dojo.withGlobal(this.editor.window,"getParentElement",dijit._editor.selection);
var _1297=dijit.range.getAncestor(_1296,this.blockNodes);
if(_1297){
if(!e.shiftKey&&_1297.tagName=="LI"){
return true;
}
_1291=dijit.range.getSelection(this.editor.window);
range=_1291.getRangeAt(0);
if(!range.collapsed){
range.deleteContents();
}
if(dijit.range.atBeginningOfContainer(_1297,range.startContainer,range.startOffset)){
if(e.shiftKey){
br=doc.createElement("br");
_1293=dijit.range.create();
_1297.insertBefore(br,_1297.firstChild);
_1293.setStartBefore(br.nextSibling);
_1291.removeAllRanges();
_1291.addRange(_1293);
}else{
dojo.place(br,_1297,"before");
}
}else{
if(dijit.range.atEndOfContainer(_1297,range.startContainer,range.startOffset)){
_1293=dijit.range.create();
br=doc.createElement("br");
if(e.shiftKey){
_1297.appendChild(br);
_1297.appendChild(doc.createTextNode(" "));
_1293.setStart(_1297.lastChild,0);
}else{
dojo.place(br,_1297,"after");
_1293.setStartAfter(_1297);
}
_1291.removeAllRanges();
_1291.addRange(_1293);
}else{
return true;
}
}
}else{
dijit._editor.RichText.prototype.execCommand.call(this.editor,"inserthtml","<br>");
}
return false;
}
var _1298=true;
_1291=dijit.range.getSelection(this.editor.window);
range=_1291.getRangeAt(0);
if(!range.collapsed){
range.deleteContents();
}
var block=dijit.range.getBlockAncestor(range.endContainer,null,this.editor.editNode);
var _129a=block.blockNode;
if((this._checkListLater=(_129a&&(_129a.nodeName=="LI"||_129a.parentNode.nodeName=="LI")))){
if(dojo.isMoz){
this._pressedEnterInBlock=_129a;
}
if(/^(?:\s|&nbsp;)$/.test(_129a.innerHTML)){
_129a.innerHTML="";
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
_1291=dijit.range.getSelection(this.editor.window);
range=_1291.getRangeAt(0);
}
var _129b=doc.createElement(this.blockNodeForEnter);
_129b.innerHTML=this.bogusHtmlContent;
this.removeTrailingBr(block.blockNode);
if(dijit.range.atEndOfContainer(block.blockNode,range.endContainer,range.endOffset)){
if(block.blockNode===block.blockContainer){
block.blockNode.appendChild(_129b);
}else{
dojo.place(_129b,block.blockNode,"after");
}
_1298=false;
_1293=dijit.range.create();
_1293.setStart(_129b,0);
_1291.removeAllRanges();
_1291.addRange(_1293);
if(this.editor.height){
_129b.scrollIntoView(false);
}
}else{
if(dijit.range.atBeginningOfContainer(block.blockNode,range.startContainer,range.startOffset)){
dojo.place(_129b,block.blockNode,block.blockNode===block.blockContainer?"first":"before");
if(_129b.nextSibling&&this.editor.height){
_129b.nextSibling.scrollIntoView(false);
}
_1298=false;
}else{
if(dojo.isMoz){
this._pressedEnterInBlock=block.blockNode;
}
}
}
return _1298;
},removeTrailingBr:function(_129c){
var para=/P|DIV|LI/i.test(_129c.tagName)?_129c:dijit._editor.selection.getParentOfType(_129c,["P","DIV","LI"]);
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
var _129f="p{margin:0 !important;}";
var _12a0=function(_12a1,doc,URI){
if(!_12a1){
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
var _12a6=function(){
try{
style.styleSheet.cssText=_12a1;
}
catch(e){
console.debug(e);
}
};
if(style.styleSheet.disabled){
setTimeout(_12a6,10);
}else{
_12a6();
}
}else{
var _12a7=doc.createTextNode(_12a1);
style.appendChild(_12a7);
}
return style;
};
_12a0(_129f,this.editor.document);
this.editor.document.__INSERTED_EDITIOR_NEWLINE_CSS=true;
return d;
}
return null;
},regularPsToSingleLinePs:function(_12a8,_12a9){
function _12aa(el){
function _12ac(nodes){
var newP=nodes[0].ownerDocument.createElement("p");
nodes[0].parentNode.insertBefore(newP,nodes[0]);
dojo.forEach(nodes,function(node){
newP.appendChild(node);
});
};
var _12b0=0;
var _12b1=[];
var _12b2;
while(_12b0<el.childNodes.length){
_12b2=el.childNodes[_12b0];
if(_12b2.nodeType==3||(_12b2.nodeType==1&&_12b2.nodeName!="BR"&&dojo.style(_12b2,"display")!="block")){
_12b1.push(_12b2);
}else{
var _12b3=_12b2.nextSibling;
if(_12b1.length){
_12ac(_12b1);
_12b0=(_12b0+1)-_12b1.length;
if(_12b2.nodeName=="BR"){
dojo.destroy(_12b2);
}
}
_12b1=[];
}
_12b0++;
}
if(_12b1.length){
_12ac(_12b1);
}
};
function _12b4(el){
var _12b6=null;
var _12b7=[];
var _12b8=el.childNodes.length-1;
for(var i=_12b8;i>=0;i--){
_12b6=el.childNodes[i];
if(_12b6.nodeName=="BR"){
var newP=_12b6.ownerDocument.createElement("p");
dojo.place(newP,el,"after");
if(_12b7.length==0&&i!=_12b8){
newP.innerHTML="&nbsp;";
}
dojo.forEach(_12b7,function(node){
newP.appendChild(node);
});
dojo.destroy(_12b6);
_12b7=[];
}else{
_12b7.unshift(_12b6);
}
}
};
var pList=[];
var ps=_12a8.getElementsByTagName("p");
dojo.forEach(ps,function(p){
pList.push(p);
});
dojo.forEach(pList,function(p){
if((p.previousSibling)&&(p.previousSibling.nodeName=="P"||dojo.style(p.previousSibling,"display")!="block")){
var newP=p.parentNode.insertBefore(this.document.createElement("p"),p);
newP.innerHTML=_12a9?"":"&nbsp;";
}
_12b4(p);
},this.editor);
_12aa(_12a8);
return _12a8;
},singleLinePsToRegularPs:function(_12c1){
function _12c2(node){
var ps=node.getElementsByTagName("p");
var _12c5=[];
for(var i=0;i<ps.length;i++){
var p=ps[i];
var _12c8=false;
for(var k=0;k<_12c5.length;k++){
if(_12c5[k]===p.parentNode){
_12c8=true;
break;
}
}
if(!_12c8){
_12c5.push(p.parentNode);
}
}
return _12c5;
};
function _12ca(node){
if(node.nodeType!=1||node.tagName!="P"){
return dojo.style(node,"display")=="block";
}else{
if(!node.childNodes.length||node.innerHTML=="&nbsp;"){
return true;
}
}
return false;
};
var _12cc=_12c2(_12c1);
for(var i=0;i<_12cc.length;i++){
var _12ce=_12cc[i];
var _12cf=null;
var node=_12ce.firstChild;
var _12d1=null;
while(node){
if(node.nodeType!="1"||node.tagName!="P"){
_12cf=null;
}else{
if(_12ca(node)){
_12d1=node;
_12cf=null;
}else{
if(_12cf==null){
_12cf=node;
}else{
if((!_12cf.lastChild||_12cf.lastChild.nodeName!="BR")&&(node.firstChild)&&(node.firstChild.nodeName!="BR")){
_12cf.appendChild(this.editor.document.createElement("br"));
}
while(node.firstChild){
_12cf.appendChild(node.firstChild);
}
_12d1=node;
}
}
}
node=node.nextSibling;
if(_12d1){
dojo.destroy(_12d1);
_12d1=null;
}
}
}
return _12c1;
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
},addPlugin:function(_12d3,index){
var args=dojo.isString(_12d3)?{name:_12d3}:_12d3;
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
console.warn("Cannot find plugin",_12d3);
return;
}
_12d3=o.plugin;
}
if(arguments.length>1){
this._plugins[index]=_12d3;
}else{
this._plugins.push(_12d3);
}
_12d3.setEditor(this);
if(dojo.isFunction(_12d3.setToolbar)){
_12d3.setToolbar(this.toolbar);
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
var _12e2=0;
if(this._savedSelection&&dojo.isIE){
_12e2=dijit._curFocus!=this.editNode;
}
this.inherited(arguments);
if(_12e2){
this._restoreSelection();
}
},_moveToBookmark:function(b){
var _12e4=b;
if(dojo.isIE){
if(dojo.isArray(b)){
_12e4=[];
dojo.forEach(b,function(n){
_12e4.push(dijit.range.getNode(n,this.editNode));
},this);
}
}else{
var r=dijit.range.create();
r.setStart(dijit.range.getNode(b.startContainer,this.editNode),b.startOffset);
r.setEnd(dijit.range.getNode(b.endContainer,this.editNode),b.endOffset);
_12e4=r;
}
dojo.withGlobal(this.window,"moveToBookmark",dijit,[_12e4]);
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
},endEditing:function(_12ec){
if(this._editTimer){
clearTimeout(this._editTimer);
}
if(this._inEditing){
this._endEditing(_12ec);
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
},_endEditing:function(_12f1){
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
dojo.declare("dojox.grid.cells._Widget",dgc._Base,{widgetClass:dijit.form.TextBox,constructor:function(_12fc){
this.widget=null;
if(typeof this.widgetClass=="string"){
dojo.deprecated("Passing a string to widgetClass is deprecated","pass the widget class object instead","2.0");
this.widgetClass=dojo.getObject(this.widgetClass);
}
},formatEditing:function(_12fd,_12fe){
this.needFormatNode(_12fd,_12fe);
return "<div></div>";
},getValue:function(_12ff){
return this.widget.attr("value");
},setValue:function(_1300,_1301){
if(this.widget&&this.widget.attr){
if(this.widget.onLoadDeferred){
var self=this;
this.widget.onLoadDeferred.addCallback(function(){
self.widget.attr("value",_1301==null?"":_1301);
});
}else{
this.widget.attr("value",_1301);
}
}else{
this.inherited(arguments);
}
},getWidgetProps:function(_1303){
return dojo.mixin({},this.widgetProps||{},{constraints:dojo.mixin({},this.constraint)||{},value:_1303});
},createWidget:function(_1304,_1305,_1306){
return new this.widgetClass(this.getWidgetProps(_1305),_1304);
},attachWidget:function(_1307,_1308,_1309){
_1307.appendChild(this.widget.domNode);
this.setValue(_1309,_1308);
},formatNode:function(_130a,_130b,_130c){
if(!this.widgetClass){
return _130b;
}
if(!this.widget){
this.widget=this.createWidget.apply(this,arguments);
}else{
this.attachWidget.apply(this,arguments);
}
this.sizeWidget.apply(this,arguments);
this.grid.rowHeightChanged(_130c);
this.focus();
},sizeWidget:function(_130d,_130e,_130f){
var p=this.getNode(_130f),box=dojo.contentBox(p);
dojo.marginBox(this.widget.domNode,{w:box.w});
},focus:function(_1312,_1313){
if(this.widget){
setTimeout(dojo.hitch(this.widget,function(){
dojox.grid.util.fire(this,"focus");
}),0);
}
},_finish:function(_1314){
this.inherited(arguments);
dojox.grid.util.removeNode(this.widget.domNode);
}});
dgc._Widget.markupFactory=function(node,cell){
dgc._Base.markupFactory(node,cell);
var d=dojo;
var _1318=d.trim(d.attr(node,"widgetProps")||"");
var _1319=d.trim(d.attr(node,"constraint")||"");
var _131a=d.trim(d.attr(node,"widgetClass")||"");
if(_1318){
cell.widgetProps=d.fromJson(_1318);
}
if(_1319){
cell.constraint=d.fromJson(_1319);
}
if(_131a){
cell.widgetClass=d.getObject(_131a);
}
};
dojo.declare("dojox.grid.cells.ComboBox",dgc._Widget,{widgetClass:dijit.form.ComboBox,getWidgetProps:function(_131b){
var items=[];
dojo.forEach(this.options,function(o){
items.push({name:o,value:o});
});
var store=new dojo.data.ItemFileReadStore({data:{identifier:"name",items:items}});
return dojo.mixin({},this.widgetProps||{},{value:_131b,store:store});
},getValue:function(){
var e=this.widget;
e.attr("displayedValue",e.attr("displayedValue"));
return e.attr("value");
}});
dgc.ComboBox.markupFactory=function(node,cell){
dgc._Widget.markupFactory(node,cell);
var d=dojo;
var _1323=d.trim(d.attr(node,"options")||"");
if(_1323){
var o=_1323.split(",");
if(o[0]!=_1323){
cell.options=o;
}
}
};
dojo.declare("dojox.grid.cells.DateTextBox",dgc._Widget,{widgetClass:dijit.form.DateTextBox,setValue:function(_1325,_1326){
if(this.widget){
this.widget.attr("value",new Date(_1326));
}else{
this.inherited(arguments);
}
},getWidgetProps:function(_1327){
return dojo.mixin(this.inherited(arguments),{value:new Date(_1327)});
}});
dgc.DateTextBox.markupFactory=function(node,cell){
dgc._Widget.markupFactory(node,cell);
};
dojo.declare("dojox.grid.cells.CheckBox",dgc._Widget,{widgetClass:dijit.form.CheckBox,getValue:function(){
return this.widget.checked;
},setValue:function(_132a,_132b){
if(this.widget&&this.widget.attributeMap.checked){
this.widget.attr("checked",_132b);
}else{
this.inherited(arguments);
}
},sizeWidget:function(_132c,_132d,_132e){
return;
}});
dgc.CheckBox.markupFactory=function(node,cell){
dgc._Widget.markupFactory(node,cell);
};
dojo.declare("dojox.grid.cells.Editor",dgc._Widget,{widgetClass:dijit.Editor,getWidgetProps:function(_1331){
return dojo.mixin({},this.widgetProps||{},{height:this.widgetHeight||"100px"});
},createWidget:function(_1332,_1333,_1334){
var _1335=new this.widgetClass(this.getWidgetProps(_1333),_1332);
dojo.connect(_1335,"onLoad",dojo.hitch(this,"populateEditor"));
return _1335;
},formatNode:function(_1336,_1337,_1338){
this.content=_1337;
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
var _133e={ELEMENT:1,ATTRIBUTE:2,TEXT:3,CDATA_SECTION:4,PROCESSING_INSTRUCTION:7,COMMENT:8,DOCUMENT:9};
var _133f=/<([^>\/\s+]*)([^>]*)>([^<]*)/g;
var _1340=/([^=]*)=(("([^"]*)")|('([^']*)'))/g;
var _1341=/<!ENTITY\s+([^"]*)\s+"([^"]*)">/g;
var _1342=/<!\[CDATA\[([\u0001-\uFFFF]*?)\]\]>/g;
var _1343=/<!--([\u0001-\uFFFF]*?)-->/g;
var trim=/^\s+|\s+$/g;
var _1345=/\s+/g;
var egt=/\&gt;/g;
var elt=/\&lt;/g;
var equot=/\&quot;/g;
var eapos=/\&apos;/g;
var eamp=/\&amp;/g;
var dNs="_def_";
function _doc(){
return new (function(){
var all={};
this.nodeType=_133e.DOCUMENT;
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
this.byName=this.getElementsByTagName=_1351;
this.byNameNS=this.getElementsByTagNameNS=_1352;
this.childrenByName=_1353;
this.childrenByNameNS=_1354;
})();
};
function _1351(name){
function __(node,name,arr){
dojo.forEach(node.childNodes,function(c){
if(c.nodeType==_133e.ELEMENT){
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
function _1352(name,ns){
function __(node,name,ns,arr){
dojo.forEach(node.childNodes,function(c){
if(c.nodeType==_133e.ELEMENT){
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
function _1353(name){
var a=[];
dojo.forEach(this.childNodes,function(c){
if(c.nodeType==_133e.ELEMENT){
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
function _1354(name,ns){
var a=[];
dojo.forEach(this.childNodes,function(c){
if(c.nodeType==_133e.ELEMENT){
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
function _136c(v){
return {nodeType:_133e.TEXT,nodeName:"#text",nodeValue:v.replace(_1345," ").replace(egt,">").replace(elt,"<").replace(eapos,"'").replace(equot,"\"").replace(eamp,"&")};
};
function _136e(name){
for(var i=0;i<this.attributes.length;i++){
if(this.attributes[i].nodeName==name){
return this.attributes[i].nodeValue;
}
}
return null;
};
function _1371(name,ns){
for(var i=0;i<this.attributes.length;i++){
if(this.ownerDocument._nsPaths[ns]==this.attributes[i].namespace&&this.attributes[i].localName==name){
return this.attributes[i].nodeValue;
}
}
return null;
};
function _1375(name,val){
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
function _137a(name,val,ns){
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
var _1387,eRe=[];
if(_1341.test(str)){
_1341.lastIndex=0;
while((_1387=_1341.exec(str))!=null){
eRe.push({entity:"&"+_1387[1].replace(trim,"")+";",expression:_1387[2]});
}
for(var i=0;i<eRe.length;i++){
str=str.replace(new RegExp(eRe[i].entity,"g"),eRe[i].expression);
}
}
}
var _138a=[],cdata;
while((cdata=_1342.exec(str))!=null){
_138a.push(cdata[1]);
}
for(var i=0;i<_138a.length;i++){
str=str.replace(_138a[i],i);
}
var _138c=[],_138d;
while((_138d=_1343.exec(str))!=null){
_138c.push(_138d[1]);
}
for(i=0;i<_138c.length;i++){
str=str.replace(_138c[i],i);
}
var res,obj=root;
while((res=_133f.exec(str))!=null){
if(res[2].charAt(0)=="/"&&res[2].replace(trim,"").length>1){
if(obj.parentNode){
obj=obj.parentNode;
}
var text=(res[3]||"").replace(trim,"");
if(text.length>0){
obj.childNodes.push(_136c(text));
}
}else{
if(res[1].length>0){
if(res[1].charAt(0)=="?"){
var name=res[1].substr(1);
var _1392=res[2].substr(0,res[2].length-2);
obj.childNodes.push({nodeType:_133e.PROCESSING_INSTRUCTION,nodeName:name,nodeValue:_1392});
}else{
if(res[1].charAt(0)=="!"){
if(res[1].indexOf("![CDATA[")==0){
var val=parseInt(res[1].replace("![CDATA[","").replace("]]",""));
obj.childNodes.push({nodeType:_133e.CDATA_SECTION,nodeName:"#cdata-section",nodeValue:_138a[val]});
}else{
if(res[1].substr(0,3)=="!--"){
var val=parseInt(res[1].replace("!--","").replace("--",""));
obj.childNodes.push({nodeType:_133e.COMMENT,nodeName:"#comment",nodeValue:_138c[val]});
}
}
}else{
var name=res[1].replace(trim,"");
var o={nodeType:_133e.ELEMENT,nodeName:name,localName:name,namespace:dNs,ownerDocument:root,attributes:[],parentNode:null,childNodes:[]};
if(name.indexOf(":")>-1){
var t=name.split(":");
o.namespace=t[0];
o.localName=t[1];
}
o.byName=o.getElementsByTagName=_1351;
o.byNameNS=o.getElementsByTagNameNS=_1352;
o.childrenByName=_1353;
o.childrenByNameNS=_1354;
o.getAttribute=_136e;
o.getAttributeNS=_1371;
o.setAttribute=_1375;
o.setAttributeNS=_137a;
o.previous=o.previousSibling=prev;
o.next=o.nextSibling=next;
var attr;
while((attr=_1340.exec(res[2]))!=null){
if(attr.length>0){
var name=attr[1].replace(trim,"");
var val=(attr[4]||attr[6]||"").replace(_1345," ").replace(egt,">").replace(elt,"<").replace(eapos,"'").replace(equot,"\"").replace(eamp,"&");
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
o.attributes.push({nodeType:_133e.ATTRIBUTE,nodeName:name,localName:ln,namespace:ns,nodeValue:val});
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
obj.childNodes.push(_136c(text));
}
}
}
}
}
}
for(var i=0;i<root.childNodes.length;i++){
var e=root.childNodes[i];
if(e.nodeType==_133e.ELEMENT){
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
this.appendArray=function(_13a1){
return this.append.apply(this,_13a1);
};
this.clear=function(){
b="";
this.length=0;
return this;
};
this.replace=function(_13a2,_13a3){
b=b.replace(_13a2,_13a3);
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
dojox.string.tokenize=function(str,re,_13aa,_13ab){
var _13ac=[];
var match,_13ae,_13af=0;
while(match=re.exec(str)){
_13ae=str.slice(_13af,re.lastIndex-match[0].length);
if(_13ae.length){
_13ac.push(_13ae);
}
if(_13aa){
if(dojo.isOpera){
var copy=match.slice(0);
while(copy.length<match.length){
copy.push(null);
}
match=copy;
}
var _13b1=_13aa.apply(_13ab,match.slice(1).concat(_13ac.length));
if(typeof _13b1!="undefined"){
_13ac.push(_13b1);
}
}
_13af=re.lastIndex;
}
_13ae=str.slice(_13af);
if(_13ae.length){
_13ac.push(_13ae);
}
return _13ac;
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
var _13b5=dojo.delegate(this);
_13b5.pop=function(){
return last;
};
return _13b5;
},pop:function(){
throw new Error("pop() called on empty Context");
},get:function(key,_13b7){
if(typeof this[key]!="undefined"){
return this._normalize(this[key]);
}
for(var i=0,dict;dict=this._dicts[i];i++){
if(typeof dict[key]!="undefined"){
return this._normalize(dict[key]);
}
}
return _13b7;
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
var _13bc=this.push();
if(dict){
dojo._mixin(this,dict);
}
return _13bc;
}});
var _13bd=/("(?:[^"\\]*(?:\\.[^"\\]*)*)"|'(?:[^'\\]*(?:\\.[^'\\]*)*)'|[^\s]+)/g;
var _13be=/\s+/g;
var split=function(_13c0,limit){
_13c0=_13c0||_13be;
if(!(_13c0 instanceof RegExp)){
_13c0=new RegExp(_13c0,"g");
}
if(!_13c0.global){
throw new Error("You must use a globally flagged RegExp with split "+_13c0);
}
_13c0.exec("");
var part,parts=[],_13c4=0,i=0;
while(part=_13c0.exec(this)){
parts.push(this.slice(_13c4,_13c0.lastIndex-part[0].length));
_13c4=_13c0.lastIndex;
if(limit&&(++i>limit-1)){
break;
}
}
parts.push(this.slice(_13c4));
return parts;
};
dd.Token=function(_13c6,_13c7){
this.token_type=_13c6;
this.contents=new String(dojo.trim(_13c7));
this.contents.split=split;
this.split=function(){
return String.prototype.split.apply(this.contents,arguments);
};
};
dd.Token.prototype.split_contents=function(limit){
var bit,bits=[],i=0;
limit=limit||999;
while(i++<limit&&(bit=_13bd.exec(this.contents))){
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
var ddt=dd.text={_get:function(_13cd,name,_13cf){
var _13d0=dd.register.get(_13cd,name.toLowerCase(),_13cf);
if(!_13d0){
if(!_13cf){
throw new Error("No tag found for "+name);
}
return null;
}
var fn=_13d0[1];
var _13d2=_13d0[2];
var parts;
if(fn.indexOf(":")!=-1){
parts=fn.split(":");
fn=parts.pop();
}
dojo["require"](_13d2);
var _13d4=dojo.getObject(_13d2);
return _13d4[fn||name]||_13d4[name+"_"]||_13d4[fn+"_"];
},getTag:function(name,_13d6){
return ddt._get("tag",name,_13d6);
},getFilter:function(name,_13d8){
return ddt._get("filter",name,_13d8);
},getTemplate:function(file){
return new dd.Template(ddt.getTemplateString(file));
},getTemplateString:function(file){
return dojo._getText(file.toString())||"";
},_resolveLazy:function(_13db,sync,json){
if(sync){
if(json){
return dojo.fromJson(dojo._getText(_13db))||{};
}else{
return dd.text.getTemplateString(_13db);
}
}else{
return dojo.xhrGet({handleAs:(json)?"json":"text",url:_13db});
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
dd.Template=dojo.extend(function(_13ec,_13ed){
var str=_13ed?_13ec:ddt._resolveTemplateArg(_13ec,true)||"";
var _13ef=ddt.tokenize(str);
var _13f0=new dd._Parser(_13ef);
this.nodelist=_13f0.parse();
},{update:function(node,_13f2){
return ddt._resolveContextArg(_13f2).addCallback(this,function(_13f3){
var _13f4=this.render(new dd._Context(_13f3));
if(node.forEach){
node.forEach(function(item){
item.innerHTML=_13f4;
});
}else{
dojo.byId(node).innerHTML=_13f4;
}
return this;
});
},render:function(_13f6,_13f7){
_13f7=_13f7||this.getBuffer();
_13f6=_13f6||new dd._Context({});
return this.nodelist.render(_13f6,_13f7)+"";
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
dd._QuickNodeList=dojo.extend(function(_13fb){
this.contents=_13fb;
},{render:function(_13fc,_13fd){
for(var i=0,l=this.contents.length;i<l;i++){
if(this.contents[i].resolve){
_13fd=_13fd.concat(this.contents[i].resolve(_13fc));
}else{
_13fd=_13fd.concat(this.contents[i]);
}
}
return _13fd;
},dummyRender:function(_1400){
return this.render(_1400,dd.Template.prototype.getBuffer()).toString();
},clone:function(_1401){
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
},resolve:function(_140a){
if(typeof this.key=="undefined"){
return "";
}
var str=this.resolvePath(this.key,_140a);
for(var i=0,_140d;_140d=this.filters[i];i++){
if(_140d[1]){
if(_140d[1][0]){
str=_140d[0](str,this.resolvePath(_140d[1][1],_140a));
}else{
str=_140d[0](str,_140d[1][1]);
}
}else{
str=_140d[0](str);
}
}
return str;
},resolvePath:function(path,_140f){
var _1410,parts;
var first=path.charAt(0);
var last=path.slice(-1);
if(!isNaN(parseInt(first))){
_1410=(path.indexOf(".")==-1)?parseInt(path):parseFloat(path);
}else{
if(first=="\""&&first==last){
_1410=path.slice(1,-1);
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
_1410=_140f.get(parts[0]);
if(dojo.isFunction(_1410)){
var self=_140f.getThis&&_140f.getThis();
if(_1410.alters_data){
_1410="";
}else{
if(self){
_1410=_1410.call(self);
}else{
_1410="";
}
}
}
for(var i=1;i<parts.length;i++){
var part=parts[i];
if(_1410){
var base=_1410;
if(dojo.isObject(_1410)&&part=="items"&&typeof _1410[part]=="undefined"){
var items=[];
for(var key in _1410){
items.push([key,_1410[key]]);
}
_1410=items;
continue;
}
if(_1410.get&&dojo.isFunction(_1410.get)&&_1410.get.safe){
_1410=_1410.get(part);
}else{
if(typeof _1410[part]=="undefined"){
_1410=_1410[part];
break;
}else{
_1410=_1410[part];
}
}
if(dojo.isFunction(_1410)){
if(_1410.alters_data){
_1410="";
}else{
_1410=_1410.call(base);
}
}else{
if(_1410 instanceof Date){
_1410=dd._Context.prototype._normalize(_1410);
}
}
}else{
return "";
}
}
}
}
return _1410;
}});
dd._TextNode=dd._Node=dojo.extend(function(obj){
this.contents=obj;
},{set:function(data){
this.contents=data;
return this;
},render:function(_141c,_141d){
return _141d.concat(this.contents);
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
},render:function(_1421,_1422){
for(var i=0;i<this.contents.length;i++){
_1422=this.contents[i].render(_1421,_1422);
if(!_1422){
throw new Error("Template must return buffer");
}
}
return _1422;
},dummyRender:function(_1424){
return this.render(_1424,dd.Template.prototype.getBuffer()).toString();
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
},{render:function(_1426,_1427){
var str=this.contents.resolve(_1426);
if(!str.safe){
str=dd._base.escape(""+str);
}
return _1427.concat(str);
}});
dd._noOpNode=new function(){
this.render=this.unrender=function(){
return arguments[1];
};
this.clone=function(){
return this;
};
};
dd._Parser=dojo.extend(function(_1429){
this.contents=_1429;
},{i:0,parse:function(_142a){
var _142b={};
_142a=_142a||[];
for(var i=0;i<_142a.length;i++){
_142b[_142a[i]]=true;
}
var _142d=new dd._NodeList();
while(this.i<this.contents.length){
token=this.contents[this.i++];
if(typeof token=="string"){
_142d.push(new dd._TextNode(token));
}else{
var type=token[0];
var text=token[1];
if(type==dd.TOKEN_VAR){
_142d.push(new dd._VarNode(text));
}else{
if(type==dd.TOKEN_BLOCK){
if(_142b[text]){
--this.i;
return _142d;
}
var cmd=text.split(/\s+/g);
if(cmd.length){
cmd=cmd[0];
var fn=ddt.getTag(cmd);
if(fn){
_142d.push(fn(this,new dd.Token(type,text)));
}
}
}
}
}
}
if(_142a.length){
throw new Error("Could not find closing tag(s): "+_142a.toString());
}
this.contents.length=0;
return _142d;
},next_token:function(){
var token=this.contents[this.i++];
return new dd.Token(token[0],token[1]);
},delete_first_token:function(){
this.i++;
},skip_past:function(_1433){
while(this.i<this.contents.length){
var token=this.contents[this.i++];
if(token[0]==dd.TOKEN_BLOCK&&token[1]==_1433){
return;
}
}
throw new Error("Unclosed tag found when looking for "+_1433);
},create_variable_node:function(expr){
return new dd._VarNode(expr);
},create_text_node:function(expr){
return new dd._TextNode(expr||"");
},getTemplate:function(file){
return new dd.Template(file);
}});
dd.register={_registry:{attributes:[],tags:[],filters:[]},get:function(_1438,name){
var _143a=dd.register._registry[_1438+"s"];
for(var i=0,entry;entry=_143a[i];i++){
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
var _143e=dd.register._registry.attributes;
for(var i=0,entry;entry=_143e[i];i++){
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
},_any:function(type,base,_1444){
for(var path in _1444){
for(var i=0,fn;fn=_1444[path][i];i++){
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
},tags:function(base,_144b){
dd.register._any("tags",base,_144b);
},filters:function(base,_144d){
dd.register._any("filters",base,_144d);
}};
var _144e=/&/g;
var _144f=/</g;
var _1450=/>/g;
var _1451=/'/g;
var _1452=/"/g;
dd._base.escape=function(value){
return dd.mark_safe(value.replace(_144e,"&amp;").replace(_144f,"&lt;").replace(_1450,"&gt;").replace(_1452,"&quot;").replace(_1451,"&#39;"));
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
var _1456=[];
var dh=dojox.dtl.filter.htmlstrings;
value=value.replace(dh._linebreaksrn,"\n");
var parts=value.split(dh._linebreaksn);
for(var i=0;i<parts.length;i++){
var part=parts[i].replace(dh._linebreakss,"").replace(dh._linebreaksbr,"<br />");
_1456.push("<p>"+part+"</p>");
}
return _1456.join("\n\n");
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
dojox.string.sprintf=function(_1463,_1464){
for(var args=[],i=1;i<arguments.length;i++){
args.push(arguments[i]);
}
var _1467=new dojox.string.sprintf.Formatter(_1463);
return _1467.format.apply(_1467,args);
};
dojox.string.sprintf.Formatter=function(_1468){
var _1469=[];
this._mapped=false;
this._format=_1468;
this._tokens=dojox.string.tokenize(_1468,this._re,this._parseDelim,this);
};
dojo.extend(dojox.string.sprintf.Formatter,{_re:/\%(?:\(([\w_]+)\)|([1-9]\d*)\$)?([0 +\-\#]*)(\*|\d+)?(\.)?(\*|\d+)?[hlL]?([\%scdeEfFgGiouxX])/g,_parseDelim:function(_146a,_146b,flags,_146d,_146e,_146f,_1470){
if(_146a){
this._mapped=true;
}
return {mapping:_146a,intmapping:_146b,flags:flags,_minWidth:_146d,period:_146e,_precision:_146f,specifier:_1470};
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
}},e:{isDouble:true,doubleNotation:"e"},E:{extend:["e"],toUpper:true},f:{isDouble:true,doubleNotation:"f"},F:{extend:["f"]},g:{isDouble:true,doubleNotation:"g"},G:{extend:["g"],toUpper:true}},format:function(_1474){
if(this._mapped&&typeof _1474!="object"){
throw new Error("format requires a mapping");
}
var str="";
var _1476=0;
for(var i=0,token;i<this._tokens.length;i++){
token=this._tokens[i];
if(typeof token=="string"){
str+=token;
}else{
if(this._mapped){
if(typeof _1474[token.mapping]=="undefined"){
throw new Error("missing key "+token.mapping);
}
token.arg=_1474[token.mapping];
}else{
if(token.intmapping){
var _1476=parseInt(token.intmapping)-1;
}
if(_1476>=arguments.length){
throw new Error("got "+arguments.length+" printf arguments, insufficient for '"+this._format+"'");
}
token.arg=arguments[_1476++];
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
var _147c=this._specifiers[token.specifier];
if(typeof _147c=="undefined"){
throw new Error("unexpected specifier '"+token.specifier+"'");
}
if(_147c.extend){
dojo.mixin(_147c,this._specifiers[_147c.extend]);
delete _147c.extend;
}
dojo.mixin(token,_147c);
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
token.minWidth=parseInt(arguments[_1476++]);
if(isNaN(token.minWidth)){
throw new Error("the argument for * width at position "+_1476+" is not a number in "+this._format);
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
token.precision=parseInt(arguments[_1476++]);
if(isNaN(token.precision)){
throw Error("the argument for * precision at position "+_1476+" is not a number in "+this._format);
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
},zeroPad:function(token,_1482){
_1482=(arguments.length==2)?_1482:token.precision;
if(typeof token.arg!="string"){
token.arg=""+token.arg;
}
var _1483=_1482-10;
while(token.arg.length<_1483){
token.arg=(token.rightJustify)?token.arg+this._zeros10:this._zeros10+token.arg;
}
var pad=_1482-token.arg.length;
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
},spacePad:function(token,_1487){
_1487=(arguments.length==2)?_1487:token.minWidth;
if(typeof token.arg!="string"){
token.arg=""+token.arg;
}
var _1488=_1487-10;
while(token.arg.length<_1488){
token.arg=(token.rightJustify)?token.arg+this._spaces10:this._spaces10+token.arg;
}
var pad=_1487-token.arg.length;
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
var _149d=[];
var width=(lines.length+"").length;
for(var i=0,line;i<lines.length;i++){
line=lines[i];
_149d.push(df.strings.ljust(i+1,width)+". "+dojox.dtl._base.escape(line));
}
return _149d.join("\n");
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
var _14a5=[];
if(typeof value=="number"){
value=value+"";
}
if(value.charAt){
for(var i=0;i<value.length;i++){
_14a5.push(value.charAt(i));
}
return _14a5;
}
if(typeof value=="object"){
for(var key in value){
_14a5.push(value[key]);
}
return _14a5;
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
var _14ad=dojox.dtl.filter.strings._strings;
if(!_14ad[arg]){
_14ad[arg]=new dojox.string.sprintf.Formatter("%"+arg);
}
return _14ad[arg].format(value);
},title:function(value){
var last,title="";
for(var i=0,_14b2;i<value.length;i++){
_14b2=value.charAt(i);
if(last==" "||last=="\n"||last=="\t"||!last){
title+=_14b2.toUpperCase();
}else{
title+=_14b2.toLowerCase();
}
last=_14b2;
}
return title;
},_truncatewords:/[ \n\r\t]/,truncatewords:function(value,arg){
arg=parseInt(arg,10);
if(!arg){
return value;
}
for(var i=0,j=value.length,count=0,_14b8,last;i<value.length;i++){
_14b8=value.charAt(i);
if(dojox.dtl.filter.strings._truncatewords.test(last)){
if(!dojox.dtl.filter.strings._truncatewords.test(_14b8)){
++count;
if(count==arg){
return value.substring(0,j+1);
}
}
}else{
if(!dojox.dtl.filter.strings._truncatewords.test(_14b8)){
j=i;
}
}
last=_14b8;
}
return value;
},_truncate_words:/(&.*?;|<.*?>|(\w[\w\-]*))/g,_truncate_tag:/<(\/)?([^ ]+?)(?: (\/)| .*?)?>/,_truncate_singlets:{br:true,col:true,link:true,base:true,img:true,param:true,area:true,hr:true,input:true},truncatewords_html:function(value,arg){
arg=parseInt(arg,10);
if(arg<=0){
return "";
}
var _14bc=dojox.dtl.filter.strings;
var words=0;
var open=[];
var _14bf=dojox.string.tokenize(value,_14bc._truncate_words,function(all,word){
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
var tag=all.match(_14bc._truncate_tag);
if(!tag||words>=arg){
return;
}
var _14c3=tag[1];
var _14c4=tag[2].toLowerCase();
var _14c5=tag[3];
if(_14c3||_14bc._truncate_singlets[_14c4]){
}else{
if(_14c3){
var i=dojo.indexOf(open,_14c4);
if(i!=-1){
open=open.slice(i+1);
}
}else{
open.unshift(_14c4);
}
}
return all;
}).join("");
_14bf=_14bf.replace(/\s+$/g,"");
for(var i=0,tag;tag=open[i];i++){
_14bf+="</"+tag+">";
}
return _14bf;
},upper:function(value){
return value.toUpperCase();
},urlencode:function(value){
return dojox.dtl.filter.strings._urlquote(value);
},_urlize:/^((?:[(>]|&lt;)*)(.*?)((?:[.,)>\n]|&gt;)*)$/,_urlize2:/^\S+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/,urlize:function(value){
return dojox.dtl.filter.strings.urlizetrunc(value);
},urlizetrunc:function(value,arg){
arg=parseInt(arg);
return dojox.string.tokenize(value,/(\S+)/g,function(word){
var _14cf=dojox.dtl.filter.strings._urlize.exec(word);
if(!_14cf){
return word;
}
var lead=_14cf[1];
var _14d1=_14cf[2];
var trail=_14cf[3];
var _14d3=_14d1.indexOf("www.")==0;
var hasAt=_14d1.indexOf("@")!=-1;
var _14d5=_14d1.indexOf(":")!=-1;
var _14d6=_14d1.indexOf("http://")==0;
var _14d7=_14d1.indexOf("https://")==0;
var _14d8=/[a-zA-Z0-9]/.test(_14d1.charAt(0));
var last4=_14d1.substring(_14d1.length-4);
var _14da=_14d1;
if(arg>3){
_14da=_14da.substring(0,arg-3)+"...";
}
if(_14d3||(!hasAt&&!_14d6&&_14d1.length&&_14d8&&(last4==".org"||last4==".net"||last4==".com"))){
return "<a href=\"http://"+_14d1+"\" rel=\"nofollow\">"+_14da+"</a>";
}else{
if(_14d6||_14d7){
return "<a href=\""+_14d1+"\" rel=\"nofollow\">"+_14da+"</a>";
}else{
if(hasAt&&!_14d3&&!_14d5&&dojox.dtl.filter.strings._urlize2.test(_14d1)){
return "<a href=\"mailto:"+_14d1+"\">"+_14d1+"</a>";
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
var _14de=[];
var parts=value.split(/\s+/g);
if(parts.length){
var word=parts.shift();
_14de.push(word);
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
_14de.push("\n");
pos=lines[lines.length-1].length;
}else{
_14de.push(" ");
if(lines.length>1){
pos=lines[lines.length-1].length;
}
}
_14de.push(word);
}
}
return _14de.join("");
}});
}
if(!dojo._hasResource["dojox.widget.Wizard"]){
dojo._hasResource["dojox.widget.Wizard"]=true;
dojo.provide("dojox.widget.Wizard");
dojo.declare("dojox.widget.Wizard",[dijit.layout.StackContainer,dijit._Templated],{widgetsInTemplate:true,templateString:"<div class=\"dojoxWizard\" dojoAttachPoint=\"wizardNode\">\r\n    <div class=\"dojoxWizardContainer\" dojoAttachPoint=\"containerNode\"></div>\r\n    <div class=\"dojoxWizardButtons\" dojoAttachPoint=\"wizardNav\">\r\n        <button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"previousButton\">${previousButtonLabel}</button>\r\n        <button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"nextButton\">${nextButtonLabel}</button>\r\n        <button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"doneButton\" style=\"display:none\">${doneButtonLabel}</button>\r\n        <button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"cancelButton\">${cancelButtonLabel}</button>\r\n    </div>\r\n</div>\r\n",nextButtonLabel:"",previousButtonLabel:"",cancelButtonLabel:"",doneButtonLabel:"",cancelFunction:null,hideDisabled:false,postMixInProperties:function(){
this.inherited(arguments);
var _14e4=dojo.mixin({cancel:dojo.i18n.getLocalization("dijit","common",this.lang).buttonCancel},dojo.i18n.getLocalization("dojox.widget","Wizard",this.lang));
var prop;
for(prop in _14e4){
if(!this[prop+"ButtonLabel"]){
this[prop+"ButtonLabel"]=_14e4[prop];
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
this._checkButtons();
this._started=true;
},_checkButtons:function(){
var sw=this.selectedChildWidget;
var _14e7=sw.isLastChild;
this.nextButton.attr("disabled",_14e7);
this._setButtonClass(this.nextButton);
if(sw.doneFunction){
this.doneButton.domNode.style.display="";
if(_14e7){
this.nextButton.domNode.style.display="none";
}
}else{
this.doneButton.domNode.style.display="none";
}
this.previousButton.attr("disabled",!this.selectedChildWidget.canGoBack);
this._setButtonClass(this.previousButton);
},_setButtonClass:function(_14e8){
_14e8.domNode.style.display=(this.hideDisabled&&_14e8.disabled)?"none":"";
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
var _14ea=this.passFunction();
switch(typeof _14ea){
case "boolean":
r=_14ea;
break;
case "string":
alert(_14ea);
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
if(!dojo._hasResource["pion._base.error"]){
dojo._hasResource["pion._base.error"]=true;
dojo.provide("pion._base.error");
pion.handleXhrError=function(_14eb,_14ec,_14ed,_14ee){
console.error("In pion.handleXhrError: response = ",_14eb,", ioArgs.args = ",_14ec.args);
if(_14ec.xhr.status==401){
if(pion.login.login_pending){
var h=dojo.connect(pion.login,"onLoginSuccess",function(){
dojo.disconnect(h);
_14ed(_14ec.args);
});
}else{
if(!dojo.cookie("logged_in")){
location.replace("login.html");
}
pion.login.doLoginDialog({success_callback:function(){
_14ed(_14ec.args);
}});
}
return;
}else{
if(_14ec.xhr.status==500){
var _14f0=new dijit.Dialog({title:"Pion Server Error"});
_14f0.attr("content",_14eb.responseText.replace(/</g,"&lt;").replace(/>/g,"&gt;"));
_14f0.show();
}
if(_14ee){
_14ee();
}
}
return _14eb;
};
pion.handleXhrGetError=function(_14f1,_14f2){
console.error("In pion.handleXhrGetError: response = ",_14f1,", ioArgs.args = ",_14f2.args);
return pion.handleXhrError(_14f1,_14f2,dojo.xhrGet);
};
pion.getXhrErrorHandler=function(_14f3,_14f4,_14f5){
return function(_14f6,_14f7){
dojo.mixin(_14f7.args,_14f4);
return pion.handleXhrError(_14f6,_14f7,_14f3,_14f5);
};
};
pion.handleFetchError=function(_14f8,_14f9){
console.debug("In pion.handleFetchError: request = ",_14f9,", errorData = "+_14f8);
if(_14f8.status==401){
if(pion.login.login_pending){
var h=dojo.connect(pion.login,"onLoginSuccess",function(){
dojo.disconnect(h);
_14f9.store.fetch(_14f9);
});
}else{
if(!dojo.cookie("logged_in")){
location.replace("login.html");
}
pion.login.doLoginDialog({success_callback:function(){
_14f9.store.fetch(_14f9);
}});
}
return;
}
};
pion.getFetchErrorHandler=function(msg){
return function(_14fc,_14fd){
console.error(msg);
return pion.handleFetchError(_14fc,_14fd);
};
};
}
if(!dojo._hasResource["pion._base.format"]){
dojo._hasResource["pion._base.format"]=true;
dojo.provide("pion._base.format");
pion.grid_cell_padding=8;
pion.scrollbar_width=20;
pion.datetime_cell_width=100;
pion.escapeXml=function(value){
if(value===false||value===0){
return value.toString();
}else{
if(value){
return value.toString().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}else{
return "";
}
}
};
pion.makeXmlLeafElement=function(_14ff,value){
return "<"+_14ff+">"+pion.escapeXml(value)+"</"+_14ff+">";
};
pion.makeXmlLeafElementFromItem=function(store,item,_1503,_1504){
if(store.hasAttribute(item,_1503)){
var value=store.getValue(item,_1503);
if(value.toString()==""){
return "";
}else{
return pion.makeXmlLeafElement(_1503,value);
}
}else{
if(_1504!==undefined){
return pion.makeXmlLeafElement(_1503,_1504);
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
if(d.toString().substr(0,11)=="&lt;button "){
return d.replace(/&lt;/g,"<");
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
return d.getUTCFullYear()+"-"+month+"-"+date+" "+hour+":"+min;
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
return d.getFullYear()+"-"+month+"-"+date+" "+hour+":"+min;
};
pion.makeDeleteButton=function(){
return "<button dojoType=dijit.form.Button class=\"delete_row\"></button>";
};
pion.makeEditButton=function(){
return "<button dojoType=dijit.form.Button><img src=\"images/icon-edit.png\" alt=\"EDIT\" border=\"0\" /></button>";
};
pion.makeInsertAboveButton=function(){
return "<button dojoType=dijit.form.Button class=\"insert_row\"><img src=\"images/arrowUp.png\" alt=\"INSERT ABOVE\" border=\"0\" /></button>";
};
}
if(!dojo._hasResource["pion._base.load"]){
dojo._hasResource["pion._base.load"]=true;
dojo.provide("pion._base.load");
pion.loadCss=function(href){
var _1516=document.createElement("link");
_1516.href=href;
_1516.rel="stylesheet";
_1516.type="text/css";
var _1517=document.getElementsByTagName("head");
if(_1517){
_1517=_1517[0];
}
if(!_1517){
_1517=document.getElementsByTagName("html")[0];
}
if(dojo.isIE){
window.setTimeout(function(){
_1517.appendChild(_1516);
},0);
}else{
_1517.appendChild(_1516);
}
};
}
if(!dojo._hasResource["pion._base"]){
dojo._hasResource["pion._base"]=true;
dojo.provide("pion._base");
}
if(!dojo._hasResource["pion.login"]){
dojo._hasResource["pion.login"]=true;
dojo.provide("pion.login");
pion.login.logout=function(){
dojo.cookie("logged_in","",{expires:-1});
dojo.xhrGet({url:"/logout",preventCache:true,handleAs:"xml",timeout:5000,load:function(_1518,_1519){
console.debug("logout response: ",_1518);
return _1518;
},error:function(_151a,_151b){
console.error("logout error: HTTP status code = ",_151b.xhr.status);
return _151a;
}});
};
pion.login.expire=function(){
dojo.xhrGet({url:"/logout",preventCache:true,handleAs:"xml",timeout:5000,load:function(_151c,_151d){
console.debug("logout response: ",_151c);
return _151c;
},error:function(_151e,_151f){
console.error("logout error: HTTP status code = ",_151f.xhr.status);
return _151e;
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
dojo.byId("current_user_menu_section").style.visibility="visible";
dojo.byId("current_user").innerHTML=dojo.cookie("user");
};
pion.login.doLoginDialog=function(_1520){
dojo.byId("current_user_menu_section").style.visibility="hidden";
pion.login.login_pending=true;
var _1521=dijit.byId("ops_toggle_button");
if(!_1521.checked){
_1521.attr("checked",true);
pion.login.ops_temporarily_suppressed=true;
}
var _1522=new pion.login.LoginDialog({});
_1522.attr("value",{Username:dojo.cookie("user")});
dojo.connect(_1522.domNode,"onkeypress",function(event){
if(event.keyCode==dojo.keys.ENTER){
_1522.execute(_1522.attr("value"));
_1522.destroyRecursive();
}
});
_1522.show();
_1522.execute=function(_1524){
if(this.execute_already_called){
console.debug("See http://trac.atomiclabs.com/ticket/685.");
return;
}
this.execute_already_called=true;
document.cookie="user="+encodeURIComponent(_1524.Username);
dojo.xhrGet({url:"/login?user="+_1524.Username+"&pass="+_1524.Password,preventCache:true,handleAs:"xml",load:function(_1525,_1526){
pion.login.login_pending=false;
pion.login.onLoginSuccess();
console.debug("login response: ioArgs.xhr = ",_1526.xhr);
if(pion.login.ops_temporarily_suppressed){
_1521.attr("checked",false);
pion.login.ops_temporarily_suppressed=false;
}
if(_1520.suppress_default_key_status_check){
if(_1520.success_callback){
_1520.success_callback();
}
}else{
pion.about.checkKeyStatus({always_callback:_1520.success_callback});
}
return _1525;
},error:function(_1527,_1528){
pion.login.login_pending=false;
if(_1528.xhr.status==401){
pion.login.doLoginDialog(_1520);
return;
}
console.error("login error: HTTP status code = ",_1528.xhr.status);
console.error("ioArgs = ",_1528);
return _1527;
}});
};
};
}
if(!dojo._hasResource["pion.plugins"]){
dojo._hasResource["pion.plugins"]=true;
dojo.provide("pion.plugins");
pion.plugins.initAvailablePluginList=function(){
var d=new dojo.Deferred();
if(pion.plugins.available_plugins){
d.callback();
}else{
dojo.xhrGet({url:"/config/plugins",handleAs:"xml",timeout:5000,load:function(_152a,_152b){
pion.plugins.available_plugins=[];
var _152c=_152a.getElementsByTagName("Plugin");
dojo.forEach(_152c,function(n){
pion.plugins.available_plugins.push(dojo.isIE?n.childNodes[0].nodeValue:n.textContent);
});
d.callback();
return _152a;
},error:pion.handleXhrGetError});
}
return d;
};
pion.plugins.getPluginPrototype=function(_152e,_152f,_1530){
var _1531=_152e+"."+_152f;
var _1532=dojo.getObject(_1531);
if(!_1532){
var path=_1530+"/"+_152f+"/"+_152f;
dojo.registerModulePath(_1531,path);
dojo.requireIf(true,_1531);
_1532=dojo.getObject(_1531);
}
return _1532;
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
var _1534=new dojo.dnd.Target(this.domNode,{accept:["connector"]});
dojo.connect(_1534,"onDndDrop",pion.reactors.handleDropOnReactor);
this.name_div=document.createElement("div");
this.name_div.innerHTML=pion.escapeXml(this.config.Name);
dojo.addClass(this.name_div,"name");
this.domNode.appendChild(this.name_div);
var _this=this;
this.run_button=new dijit.form.ToggleButton();
var _1536=this.run_button.domNode;
dojo.connect(_1536,"click",function(){
dojo.xhrPut({url:"/config/reactors/"+_this.config["@id"]+(_this.run_button.checked?"/start":"/stop"),error:pion.getXhrErrorHandler(dojo.xhrPut)});
});
this.domNode.appendChild(_1536);
this.ops_per_sec=document.createElement("span");
dojo.addClass(this.ops_per_sec,"ops_per_sec");
this.ops_per_sec.innerHTML="0";
this.domNode.appendChild(this.ops_per_sec);
this.domNode.setAttribute("reactor_type",this.config.Plugin);
var _1537=pion.reactors.categories[this.config.Plugin];
dojo.addClass(this.domNode,_1537);
if(_1537!="collection"){
this.run_button.attr("checked",true);
}
dojo.addClass(this.domNode,"moveable");
dojo.addClass(this.domNode,"reactor");
dojo.addClass(this.domNode,this.config.Plugin);
var m5=new dojo.dnd.move.parentConstrainedMoveable(this.domNode,{area:"padding",within:true});
var c=m5.constraints();
c.r=c.l+c.w-this.offsetWidth;
c.b=c.t+c.h-this.offsetHeight;
var _153a={l:this.config.X,t:this.config.Y};
console.debug("mouseLeftTop: ",_153a);
var _153b=pion.reactors.getNearbyGridPointInBox(c,_153a);
this.domNode.style.top=_153b.t+"px";
this.domNode.style.left=_153b.l+"px";
this.domNode.style.position="absolute";
this.domNode.style.background="url(../plugins/reactors/"+_1537+"/"+this.config.Plugin+"/bg-moveable.png) repeat-x";
this.domNode.style.zIndex=300;
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
m5.onMove=function(mover,_153f){
var _1540=pion.reactors.getNearbyGridPointInBox(this.constraintBox,_153f);
dojo.marginBox(mover.node,_1540);
for(var i=0;i<_this.reactor_inputs.length;++i){
pion.reactors.updateConnectionLine(_this.reactor_inputs[i].line,_this.reactor_inputs[i].source.domNode,_this.domNode);
}
for(var i=0;i<_this.reactor_outputs.length;++i){
pion.reactors.updateConnectionLine(_this.reactor_outputs[i].line,_this.domNode,_this.reactor_outputs[i].sink.domNode);
}
};
dojo.connect(m5,"onMoveStop",this,this.handleMoveStop);
},_initOptions:function(_1542,_1543){
var store=pion.reactors.config_store;
var _this=this;
store.fetch({query:{"@id":_1542["@id"]},onItem:function(item){
_1542.options=[];
for(var _1547 in _1543){
_1542[_1547]=_1543[_1547];
if(store.hasAttribute(item,_1547)){
_1542[_1547]=(store.getValue(item,_1547).toString()=="true");
}
if(_1542[_1547]){
_1542.options.push(_1547);
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
dojo.rawXhrPut({url:"/config/reactors/"+this.config["@id"]+"/move",contentType:"text/xml",handleAs:"xml",putData:this.put_data,load:function(_154a){
console.debug("response: ",_154a);
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:this.put_data})});
},changeWorkspace:function(_154b){
if(this.config.Workspace==_154b){
return;
}
this.config.Workspace=_154b;
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
dojo.rawXhrPut({url:"/config/reactors/"+this.config["@id"]+"/move",contentType:"text/xml",handleAs:"xml",putData:this.put_data,load:function(_154d){
console.debug("response: ",_154d);
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:this.put_data})});
},getOptionalBool:function(store,item,_1550){
var temp=store.getValue(item,_1550);
if(temp!==undefined&&temp!==null){
return store.getValue(item,_1550).toString()=="true";
}else{
return plugins.reactors[this.config.Plugin].grid_option_defaults[_1550];
}
}});
dojo.declare("plugins.reactors.ReactorIcon",[],{});
dojo.declare("plugins.reactors.ReactorInitDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">${title}</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<table>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Name:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Comments:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t</table>\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: tryConfig\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t</div>\r\n\t<span dojoAttachPoint=\"tabEnd\" tabindex=\"0\"></span>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,tryConfig:function(){
var _1552=this.attr("value");
console.debug(_1552);
console.debug("this.plugin = ",this.plugin);
var _1553=pion.reactors.workspace_box;
var dc=dojo.coords(_1553.node);
var X=Math.floor(pion.reactors.last_x-dc.x);
var Y=Math.floor(pion.reactors.last_y-dc.y);
this.post_data="<PionConfig><Reactor>"+pion.makeXmlLeafElement("Plugin",this.plugin)+pion.makeXmlLeafElement("Workspace",_1553.my_content_pane.title)+"<X>"+X+"</X><Y>"+Y+"</Y>";
for(var tag in _1552){
if(tag!="options"){
console.debug("dialogFields[",tag,"] = ",_1552[tag]);
this.post_data+=pion.makeXmlLeafElement(tag,_1552[tag]);
}
}
if("options" in _1552&&plugins.reactors[this.plugin].option_defaults){
for(var _1558 in plugins.reactors[this.plugin].option_defaults){
this.post_data+="<"+_1558+">";
this.post_data+=(dojo.indexOf(_1552.options,_1558)!=-1);
this.post_data+="</"+_1558+">";
}
}
if(this._insertCustomData){
this._insertCustomData(_1552);
}
var _1559=plugins.reactors[this.plugin].other_defaults;
if(_1559){
for(var key in _1559){
this.post_data+="<"+key+">"+_1559[key]+"</"+key+">";
}
}
this.post_data+="</Reactor></PionConfig>";
console.debug("post_data: ",this.post_data);
var _this=this;
dojo.rawXhrPost({url:"/config/reactors",contentType:"text/xml",handleAs:"xml",postData:this.post_data,load:function(_155c){
var node=_155c.getElementsByTagName("Reactor")[0];
var _155e={"@id":node.getAttribute("id")};
var _155f=node.childNodes;
for(var i=0;i<_155f.length;++i){
if(_155f[i].firstChild){
_155e[_155f[i].tagName]=_155f[i].firstChild.nodeValue;
}
}
var _1561=document.createElement("div");
_1553.node.replaceChild(_1561,_1553.node.lastChild);
var _1562=pion.reactors.createReactor(_155e,_1561);
pion.reactors.reactors_by_id[_155e["@id"]]=_1562;
_1562.workspace=_1553;
_1553.reactors.push(_1562);
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
},reactor:"",execute:function(_1564){
if(this.execute_already_called){
console.debug("See http://trac.atomiclabs.com/ticket/685.");
return;
}
this.execute_already_called=true;
dojo.mixin(this.reactor.config,_1564);
this.reactor.name_div.innerHTML=pion.escapeXml(_1564.Name);
this.put_data="<PionConfig><Reactor>"+pion.makeXmlLeafElement("Plugin",this.reactor.config.Plugin)+pion.makeXmlLeafElement("Workspace",this.reactor.config.Workspace)+"<X>"+this.reactor.config.X+"</X><Y>"+this.reactor.config.Y+"</Y>";
for(var tag in _1564){
if(dojo.indexOf(this.reactor.special_config_elements,tag)==-1){
console.debug("dialogFields[",tag,"] = ",_1564[tag]);
this.put_data+=pion.makeXmlLeafElement(tag,_1564[tag]);
}
}
if("options" in _1564&&plugins.reactors[this.reactor.config.Plugin].option_defaults){
for(var _1566 in plugins.reactors[this.reactor.config.Plugin].option_defaults){
var _1567=(dojo.indexOf(_1564.options,_1566)!=-1);
this.put_data+="<"+_1566+">"+_1567+"</"+_1566+">";
this.reactor.config[_1566]=_1567;
}
}
if(this._insertCustomData){
this._insertCustomData(_1564);
}
this.put_data+="</Reactor></PionConfig>";
console.debug("put_data: ",this.put_data);
var _this=this;
dojo.rawXhrPut({url:"/config/reactors/"+this.reactor.config["@id"],contentType:"text/xml",handleAs:"xml",putData:this.put_data,load:function(_1569){
console.debug("response: ",_1569);
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
if(this.containerNode.value!=value){
if(dojo.some(this.containerNode.options,function(opt){
return opt.value==value;
})){
this.onError(new Error("SimpleSelect error: value could not be set to '"+value+"'."));
}else{
this.onError(new Error("SimpleSelect error: '"+value+"' is not one of the current options."));
}
return;
}
}
this._handleOnChange(value,true);
}else{
var h=this.connect(this,"_onDoneAddingOptions",function(){
this.disconnect(h);
if(value===null){
this.containerNode.selectedIndex=-1;
}else{
this.containerNode.value=value;
if(this.containerNode.value!=value){
if(dojo.some(this.containerNode.options,function(opt){
return opt.value==value;
})){
this.onError(new Error("SimpleSelect error: value could not be set to '"+value+"'."));
}else{
this.onError(new Error("SimpleSelect error: '"+value+"' is not one of the current options."));
}
return;
}
}
this._handleOnChange(value,true);
});
}
},deferredSet:function(v){
var dfd=new dojo.Deferred();
this.focus();
if(this._lastValueReported==v){
dfd.callback(v);
return dfd;
}
var h1=dojo.connect(this,"onChangeDone",function(e){
dojo.disconnect(h1);
dojo.disconnect(h2);
dfd.callback(e);
});
var h2=dojo.connect(this,"onError",function(e){
dojo.disconnect(h1);
dojo.disconnect(h2);
dfd.errback(e);
});
this.attr("value",v);
return dfd;
},onChangeDone:function(e){
},onError:function(e){
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
this.first_option=null;
this.store.fetch({query:_this.query,onItem:function(item){
var key=_this.keyAttr?_this.store.getValue(item,_this.keyAttr):_this.store.getIdentity(item);
var label=_this.searchAttr?_this.store.getValue(item,_this.searchAttr):key;
if(dojo.isIE){
_this.containerNode.add(new Option(label,key));
}else{
_this.containerNode.add(new Option(label,key),null);
}
if(_this.first_option==null){
_this.first_option=key;
}
},onComplete:function(){
_this._onDoneAddingOptions(_this.first_option);
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
if(!dojo._hasResource["pion.widgets.ConfigAccordion"]){
dojo._hasResource["pion.widgets.ConfigAccordion"]=true;
dojo.provide("pion.widgets.ConfigAccordion");
dojo.declare("pion.widgets.ConfigAccordion",[dijit.layout.AccordionContainer],{widgetsInTemplate:true,createNewPaneFromItem:function(item,store){
var _157f=this.title_attribute||"Name";
var title=pion.escapeXml(store.getValue(item,_157f));
var pane=new dijit.layout.ContentPane({title:title,content:"loading..."});
pane.config_item=item;
pane.uuid=store.getValue(item,"@id");
this.addChild(pane);
return pane;
},createPanesFromAllItems:function(items,store){
for(var i=0;i<items.length;++i){
this.createNewPaneFromItem(items[i],store);
}
var _1585=this.getChildren()[0];
this.removeChild(_1585);
var _this=this;
var _1587=this._borderBox;
function _1588(){
if(_this._borderBox==_1587){
setTimeout(_1588,1000);
}else{
_this.resize({h:_this._borderBox.h});
}
};
_1588();
}});
}
if(!dojo._hasResource["pion.widgets.TermSelector"]){
dojo._hasResource["pion.widgets.TermSelector"]=true;
dojo.provide("pion.widgets.TermSelector");
dojo.declare("pion.widgets.TermSelector",[dijit._Widget,dijit._Templated],{templateString:"<table cellspacing=\"0\" cellpadding=\"0\" class=\"termSelectorContainer\">\r\n\t<thead>\r\n\t\t<tr class=\"dijitReset termSelectorHead\" valign=\"top\">\r\n\t\t\t<th>\r\n\t\t\t\tVocabulary\r\n\t\t\t</th>\r\n\t\t\t<th>\r\n\t\t\t\tTerm\r\n\t\t\t</th>\r\n\t\t</tr>\r\n\t</thead>\r\n\t<tbody class=\"dijitReset termSelectorBody\">\r\n\t\t<tr>\r\n\t\t\t<td>\r\n\t\t\t\t<select dojoAttachPoint=\"vocab_select\" size=9 style=\"width: 100%\">\r\n\t\t\t\t</select>\r\n\t\t\t</td><td>\r\n\t\t\t\t<select dojoAttachPoint=\"term_select\" dojoAttachEvent=\"ondblclick: _handleDoubleClick\" size=9 style=\"width: 100%\">\r\n\t\t\t\t</select>\r\n\t\t\t</td>\r\n\t\t</tr>\r\n\t\t<tr>\r\n\t\t\t<td>\r\n\t\t\t\t<div style=\"width: 230px; height: 1px\" />\r\n\t\t\t</td><td>\r\n\t\t\t\t<div style=\"width: 230px; height: 1px\" />\r\n\t\t\t</td>\r\n\t\t</tr>\r\n\t</tbody>\r\n\t<tfoot class=\"dijitReset\">\r\n\t\t<tr>\r\n\t\t\t<td colspan=\"2\">\r\n\t\t\t\t<input dojoAttachPoint=\"term_comment\" disabled=\"true\" style=\"width: 99%; margin-top:5px; margin-bottom:5px;\" />\r\n\t\t\t</td>\r\n\t\t</tr>\r\n\t\t<tr>\r\n\t\t\t<td class='dijitReset' valign=\"top\" colspan=\"2\">\r\n\t\t\t\t<button class=\"add_new\" dojoAttachEvent=\"onclick: _handleAddNewVocabulary\" style=\"width: 180px\">Add new vocabulary</button>\r\n\t\t\t\t<button class=\"add_new disabled\" dojoAttachEvent=\"onclick: _handleAddNewTerm\"\r\n\t\t\t\t\t\tdojoAttachPoint=\"add_new_term_button\" disabled=true style=\"width: 140px\">Add new term</button>\r\n\t\t\t\t<button class=\"save disabled\" dojoAttachEvent=\"onclick: _handleSelectTerm\"\r\n\t\t\t\t\t\tdojoAttachPoint=\"select_term_button\" disabled=true style=\"width: 125px\">Select term</button>\r\n\t\t\t</td>\r\n\t\t</tr>\r\n\t</tfoot>\r\n</table>\r\n",_handleAddNewVocabulary:function(e){
pion.vocabularies.addNewVocabulary();
},_handleAddNewTerm:function(e){
var _158b=new plugins.vocabularies.TermInitDialog({vocabulary:this.vocabulary});
var _this=this;
_158b.onNewTermSaved=function(_158d){
_this.value=_158d;
_this.onValueSelected(_158d);
};
setTimeout(function(){
dojo.query("input",_158b.domNode)[0].select();
},500);
_158b.show();
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
var _1593=this.initial_term?this.initial_term.toString().split("#")[0]:"";
pion.vocabularies.vocabularies_by_id={};
var index=0;
var _1595=0;
pion.vocabularies.config_store.fetch({sort:[{attribute:"@id"}],onItem:function(item){
var id=pion.vocabularies.config_store.getValue(item,"@id");
if(id==_1593){
_1595=index;
}
var _1598=id.split(":")[2];
if(dojo.isIE){
_this.vocab_select.add(new Option(_1598,id));
}else{
_this.vocab_select.add(new Option(_1598,id),null);
}
pion.vocabularies.vocabularies_by_id[id]=new plugins.vocabularies.Vocabulary({"@id":id});
++index;
},onComplete:function(){
_this.vocab_select.focus();
_this.vocab_select.selectedIndex=_1595;
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
var _159b=id.split(":")[2];
var label=_this.vocabulary.config.Locked?_159b+" (L)":_159b;
_this.vocab_select.options[_this.vocab_select.selectedIndex].text=label;
_this.term_select.options.length=0;
_this.term_comments_by_id={};
var index=0;
var _159e=0;
_this.vocabulary.vocab_term_store.fetch({sort:[{attribute:"ID"}],onItem:function(item){
var _15a0=_this.vocabulary.vocab_term_store.getValue(item,"full_id");
var _15a1=true;
if(_this.query&&_this.query.category){
_15a1=(pion.terms.categories_by_id[_15a0]==_this.query.category);
}else{
if(_this.query&&_this.query.type){
var type=_this.vocabulary.vocab_term_store.getValue(item,"Type");
_15a1=(type==_this.query.type);
}
}
if(_15a1){
if(_this.initial_term&&_this.initial_term.toString()==_15a0){
_159e=index;
}
_this.term_comments_by_id[_15a0]=_this.vocabulary.vocab_term_store.getValue(item,"Comment");
var id=_this.vocabulary.vocab_term_store.getValue(item,"ID");
if(dojo.isIE){
_this.term_select.add(new Option(id,_15a0));
}else{
_this.term_select.add(new Option(id,_15a0),null);
}
++index;
}
},onComplete:function(){
_this.term_select.selectedIndex=_159e;
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
},_setValueAttr:function(value,_15a9,_15aa){
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
var _15ab=this;
if(!this._picker){
var _15ac=dojo.getObject(this.popupClass,false);
this._picker=new _15ac({onValueSelected:function(value){
if(_15ab._tabbingAway){
delete _15ab._tabbingAway;
}else{
_15ab.focus();
}
setTimeout(dojo.hitch(_15ab,"_close"),1);
pion.widgets._TermTextBox.superclass._setValueAttr.call(_15ab,value,true);
},initial_term:_15ab.value,query:_15ab.query,lang:_15ab.lang,constraints:_15ab.constraints});
}
if(!this._opened){
dijit.popup.open({parent:this,popup:this._picker,around:this.domNode,onCancel:dojo.hitch(this,this._close),onClose:function(){
_15ab._opened=false;
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
},_setDisplayedValueAttr:function(value,_15af){
this._setValueAttr(this.parse(value,this.constraints),_15af,value);
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
dojo.declare("pion.widgets.TermTextCell",dojox.grid.cells._Widget,{widgetClass:pion.widgets.TermTextBox,getWidgetProps:function(_15b3){
return dojo.mixin(this.inherited(arguments),{value:_15b3});
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
dojo.declare("plugins.codecs.CodecPane",[dijit.layout.ContentPane,dijit._Templated],{templateString:"<div class='codec_pane' dojoAttachPoint='containerNode'\r\n\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t><br/\r\n\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t><td rowspan=\"4\" valign=\"top\"><textarea rows=\"4\" name=\"Comment\" class=\"comment\"></textarea></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t><td rowspan=\"3\">&nbsp;</td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Plugin\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"EventType\"\r\n\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" query=\"{Type: 'object'}\" /></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t\t><br/\r\n\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"border: 1px solid #999999;\" width=\"99%\"\r\n\t\t\t><tr\r\n\t\t\t\t><td class=\"matrixMainHeader\">Map Field Names to Terms</td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td style=\"background-color: #f1f1f1;\"\r\n\t\t\t\t\t><div class=\"codec_grid plugin_pane_grid\" dojoAttachPoint=\"field_mapping_grid_node\"></div\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"add_new_row\" dojoAttachEvent=\"onClick: _handleAddNewField\">ADD NEW ROW</button\r\n\t\t\t\t></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: save\">Save Changes</button\r\n\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: cancel\">Cancel Changes</button\r\n\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick: delete2\">Delete Codec</button\r\n\t\t></div\r\n\t></form\r\n></div>\r\n",postMixInProperties:function(){
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
var _15bb={};
var _15bc=store.getAttributes(item);
for(var i=0;i<_15bc.length;++i){
if(dojo.indexOf(this.special_config_elements,_15bc[i])==-1){
_15bb[_15bc[i]]=store.getValue(item,_15bc[i]).toString();
}
}
if(this._addCustomConfigValues){
this._addCustomConfigValues(_15bb,item);
}
this.form.attr("value",_15bb);
var _15be=dojo.query("textarea.comment",this.form.domNode)[0];
_15be.value=_15bb.Comment;
this._reloadFieldMappingStore(item);
var node=this.domNode;
setTimeout(function(){
dojo.removeClass(node,"unsaved_changes");
},500);
},_reloadFieldMappingStore:function(_15c0){
var _this=this;
this.field_mapping_store.fetch({onItem:function(_15c2){
_this.field_mapping_store.deleteItem(_15c2);
},onComplete:function(){
_this._repopulateFieldMappingStore(_15c0);
},onError:pion.handleFetchError});
},_repopulateFieldMappingStore:function(_15c3){
var _this=this;
var store=pion.codecs.config_store;
dojo.forEach(store.getValues(_15c3,"Field"),function(_15c6){
var _15c7={ID:_this.field_mapping_store.next_id++,FieldName:store.getValue(_15c6,"text()"),Term:store.getValue(_15c6,"@term")};
_this.field_mapping_store.newItem(_15c7);
});
},_handleCellEdit:function(_15c8,_15c9,_15ca){
console.debug("CodecPane._handleCellEdit inValue = ",_15c8,", inRowIndex = ",_15c9,", inFieldIndex = ",_15ca);
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
var _15ce="";
var store=this.field_mapping_store;
dojo.forEach(items,function(item){
_15ce+="<Field term=\""+store.getValue(item,"Term")+"\">";
_15ce+=pion.escapeXml(store.getValue(item,"FieldName"))+"</Field>";
});
return _15ce;
},doPutRequest:function(){
var _15d1=this.form.attr("value");
var _15d2=dojo.query("textarea.comment",this.form.domNode)[0];
_15d1.Comment=_15d2.value;
var _15d3="<PionConfig><Codec>";
for(var tag in _15d1){
if(tag.charAt(0)!="@"&&tag!="options"){
console.debug("config[",tag,"] = ",_15d1[tag]);
_15d3+=pion.makeXmlLeafElement(tag,_15d1[tag]);
}
}
if(this._makeCustomElements){
_15d3+=this._makeCustomElements(_15d1);
}
_15d3+=this.field_mapping_put_data;
_15d3+="</Codec></PionConfig>";
console.debug("put_data: ",_15d3);
_this=this;
dojo.rawXhrPut({url:"/config/codecs/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:_15d3,load:function(_15d5){
console.debug("response: ",_15d5);
pion.codecs.config_store.fetch({query:{"@id":_this.uuid},onItem:function(item){
_this.config_item=item;
_this.populateFromConfigItem(item);
},onError:pion.handleFetchError});
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_15d3})});
},cancel:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.populateFromConfigItem(this.config_item);
},delete2:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
console.debug("delete2: selected codec is ",this.title);
_this=this;
dojo.xhrDelete({url:"/config/codecs/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_15d7,_15d8){
console.debug("xhrDelete for url = /config/codecs/"+this.uuid,"; HTTP status code: ",_15d8.xhr.status);
dijit.byId("codec_config_accordion").forward();
dijit.byId("codec_config_accordion").removeChild(_this);
pion.codecs._adjustAccordionSize();
return _15d7;
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
dojo.declare("plugins.codecs.LogCodecPane",[plugins.codecs.CodecPane],{templateString:"<div class='codec_pane' dojoAttachPoint='containerNode'\r\n\t\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t\t><br/\r\n\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t\t><tr\r\n\t\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t\t><td rowspan=\"3\" valign=\"top\"><textarea rows=\"4\" name=\"Comment\" class=\"comment\"></textarea></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Plugin\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"EventType\"\r\n\t\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" query=\"{Type: 'object'}\" /></td\r\n\t\t\t\t\t><td><label>Time&nbsp;Offset&nbsp;(minutes)</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"TimeOffset\" style=\"width: 50px;\"/></td\r\n\t\t\t\t></tr\r\n\t\t\t></table\r\n\t\t\t><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"Flush\"/\r\n\t\t\t><label>Flush output stream after each write</label\r\n\t\t\t><br/\r\n\t\t\t><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"Headers\" dojoAttachEvent=\"onClick: updateDisabling\"/\r\n\t\t\t><label>Extended Log Format</label\r\n\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\" dojoAttachPoint=\"separators\"\r\n\t\t\t\t><tr\r\n\t\t\t\t\t><th width=\"120px\"></th\r\n\t\t\t\t\t><th>Record Separators</th\r\n\t\t\t\t\t><th rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</th\r\n\t\t\t\t\t><th width=\"120px\"></th\r\n\t\t\t\t\t><th>Field Separators</th\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Split&nbsp;Set</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@event_split_set\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t><td><label class=\"disable_for_ELF\">Split&nbsp;Set</label></td\r\n\t\t\t\t\t><td><input class=\"disable_for_ELF\" dojoType=\"dijit.form.TextBox\" name=\"@field_split_set\" style=\"width: 95%;\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Join&nbsp;String</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@event_join_string\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t><td><label class=\"disable_for_ELF\">Join&nbsp;String</label></td\r\n\t\t\t\t\t><td><input class=\"disable_for_ELF\" dojoType=\"dijit.form.TextBox\" name=\"@field_join_string\" style=\"width: 95%;\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Comment&nbsp;Char</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.ValidationTextBox\" regExp=\".?\" name=\"@comment_prefix\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t><td><label class=\"disable_for_ELF\">Consecutive&nbsp;Delimiters</label></td\r\n\t\t\t\t\t><td\r\n\t\t\t\t\t\t ><select dojoType=\"pion.widgets.SimpleSelect\" style=\"width: 95%;\" name=\"@consec_field_delims\"\r\n\t\t\t\t\t\t\t><option value=\"true\">equivalent to single delimiter</option\r\n\t\t\t\t\t\t\t><option value=\"false\">indicate empty fields</option\r\n\t\t\t\t\t\t></select\r\n\t\t\t\t\t></td\r\n\t\t\t\t></tr\r\n\t\t\t></table\r\n\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"border: 1px solid #999999;\" width=\"99%\"\r\n\t\t\t\t><tr\r\n\t\t\t\t\t><td class=\"matrixMainHeader\">Map Field Names to Terms</td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td style=\"background-color: #f1f1f1;\"\r\n\t\t\t\t\t\t><div class=\"codec_grid plugin_pane_grid\" dojoAttachPoint=\"field_mapping_grid_node\"></div\r\n\t\t\t\t\t\t><button dojoType=dijit.form.Button class=\"add_new_row\" dojoAttachEvent=\"onClick: _handleAddNewField\">ADD NEW ROW</button\r\n\t\t\t\t\t></td\r\n\t\t\t\t></tr\r\n\t\t\t></table\r\n\t\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: save\">Save Changes</button\r\n\t\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: cancel\">Cancel Changes</button\r\n\t\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick: delete2\">Delete Codec</button\r\n\t\t\t></div\r\n\t\t></form\r\n></div>\r\n",postMixInProperties:function(){
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
this.field_mapping_grid_layout=[{defaultCell:{editable:true,type:dojox.grid.cells._Widget,styles:"text-align: left;"},rows:[{field:"FieldName",name:"Field Name",width:15,formatter:pion.xmlCellFormatter},{field:"Term",name:"Term",width:15,type:pion.widgets.TermTextCell},{field:"StartChar",name:"Start Char",styles:"text-align: center",width:3},{field:"EndChar",name:"End Char",styles:"text-align: center",width:3},{field:"StartEndOptional",name:"Start/End Optional",width:4,type:dojox.grid.cells.Bool},{field:"URLEncode",name:"URL Encode",width:4,type:dojox.grid.cells.Bool},{field:"EscapeChar",name:"Escape Char",styles:"text-align: center",width:3},{field:"EmptyString",name:"Empty String",width:3,formatter:pion.xmlCellFormatter},{field:"Order",name:"Order",width:"auto",widgetClass:dijit.form.NumberSpinner},{name:"Delete",styles:"align: center;",width:3,editable:false,formatter:pion.makeDeleteButton}]}];
},getHeight:function(){
return 620;
},_addCustomConfigValues:function(_15da,item){
var store=pion.codecs.config_store;
_15da.options=[];
if(store.hasAttribute(item,"Flush")){
if(store.getValue(item,"Flush").toString()=="true"){
_15da.options.push("Flush");
}
}
var _15dd=false;
if(store.hasAttribute(item,"Headers")){
if(store.getValue(item,"Headers").toString()=="true"){
_15da.options.push("Headers");
this.disableAndClearFieldSeparatorFields();
_15dd=true;
}
}
var _15de=store.getValue(item,"Events");
if(_15de){
_15da["@event_split_set"]=store.getValue(_15de,"@split");
_15da["@event_join_string"]=store.getValue(_15de,"@join");
_15da["@comment_prefix"]=store.getValue(_15de,"@comment");
}
if(!_15dd){
var _15df=store.getValue(item,"Fields");
if(_15df){
_15da["@field_split_set"]=store.getValue(_15df,"@split");
_15da["@field_join_string"]=store.getValue(_15df,"@join");
_15da["@consec_field_delims"]=store.getValue(_15df,"@consume");
}
}
},_makeCustomElements:function(_15e0){
var _15e1="<Flush>";
_15e1+=(dojo.indexOf(_15e0.options,"Flush")!=-1);
_15e1+="</Flush><Headers>";
_15e1+=(dojo.indexOf(_15e0.options,"Headers")!=-1);
_15e1+="</Headers><Events";
if(_15e0["@event_split_set"]){
_15e1+=" split=\""+pion.escapeXml(_15e0["@event_split_set"])+"\"";
}
if(_15e0["@event_join_string"]){
_15e1+=" join=\""+pion.escapeXml(_15e0["@event_join_string"])+"\"";
}
if(_15e0["@comment_prefix"]){
_15e1+=" comment=\""+pion.escapeXml(_15e0["@comment_prefix"])+"\"";
}
_15e1+="/><Fields";
if(_15e0["@field_split_set"]){
_15e1+=" split=\""+pion.escapeXml(_15e0["@field_split_set"])+"\"";
}
if(_15e0["@field_join_string"]){
_15e1+=" join=\""+pion.escapeXml(_15e0["@field_join_string"])+"\"";
}
if(_15e0["@consec_field_delims"]){
_15e1+=" consume=\""+pion.escapeXml(_15e0["@consec_field_delims"])+"\"";
}
_15e1+="/>";
return _15e1;
},_repopulateFieldMappingStore:function(_15e2){
var _this=this;
var store=pion.codecs.config_store;
_this.order_map=[];
var order=1;
dojo.forEach(store.getValues(_15e2,"Field"),function(_15e6){
var _15e7={ID:_this.field_mapping_store.next_id++,FieldName:store.getValue(_15e6,"text()"),Term:store.getValue(_15e6,"@term"),StartChar:store.getValue(_15e6,"@start"),EndChar:store.getValue(_15e6,"@end"),StartEndOptional:store.getValue(_15e6,"@optional"),URLEncode:store.getValue(_15e6,"@urlencode"),EscapeChar:store.getValue(_15e6,"@escape"),EmptyString:store.getValue(_15e6,"@empty"),Order:order};
_this.field_mapping_store.newItem(_15e7);
_this.order_map.push(order++);
});
},_handleCellEdit:function(_15e8,_15e9,_15ea){
console.debug("LogCodecPane._handleCellEdit inValue = ",_15e8,", inRowIndex = ",_15e9,", attr_name = ",_15ea);
dojo.addClass(this.domNode,"unsaved_changes");
if(_15ea=="Order"){
var _15eb=this.order_map[_15e9];
var _15ec=this.order_map;
console.debug("1: order_map = ",_15ec);
_15ec[_15e9]=_15e8;
if(_15e8>_15eb){
for(var i=0;i<_15ec.length;++i){
if(_15ec[i]>_15eb&&_15ec[i]<=_15e8&&i!=_15e9){
_15ec[i]--;
}
}
}else{
for(var i=0;i<_15ec.length;++i){
if(_15ec[i]>=_15e8&&_15ec[i]<_15eb&&i!=_15e9){
_15ec[i]++;
}
}
}
console.debug("2: order_map = ",_15ec);
for(var i=0;i<_15ec.length;++i){
var item=this.field_mapping_grid.getItem(i);
this.field_mapping_store.setValue(item,"Order",_15ec[i]);
}
}
},_makeFieldElements:function(items){
var _15f0=items.length;
var _15f1=[];
for(var i=0;i<_15f0;++i){
if(this.order_map.length==_15f0){
_15f1[this.order_map[i]-1]=i;
}else{
_15f1[i]=i;
}
}
console.debug("this.order_map = ",this.order_map);
console.debug("inverse_order_map = ",_15f1);
var _15f3="";
var store=this.field_mapping_store;
for(var i=0;i<_15f0;++i){
var item=items[_15f1[i]];
_15f3+="<Field term=\""+store.getValue(item,"Term")+"\"";
if(store.getValue(item,"StartChar")){
_15f3+=" start=\""+pion.escapeXml(store.getValue(item,"StartChar"))+"\"";
}
if(store.getValue(item,"EndChar")){
_15f3+=" end=\""+pion.escapeXml(store.getValue(item,"EndChar"))+"\"";
}
if(store.getValue(item,"StartEndOptional")){
_15f3+=" optional=\"true\"";
}
if(store.getValue(item,"URLEncode")){
_15f3+=" urlencode=\"true\"";
}
if(store.getValue(item,"EscapeChar")){
_15f3+=" escape=\""+pion.escapeXml(store.getValue(item,"EscapeChar"))+"\"";
}
if(store.getValue(item,"EmptyString")){
_15f3+=" empty=\""+pion.escapeXml(store.getValue(item,"EmptyString"))+"\"";
}
_15f3+=">"+pion.escapeXml(store.getValue(item,"FieldName"))+"</Field>";
}
return _15f3;
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
var _15f9=this.form.attr("value");
_15f9["@field_split_set"]="";
_15f9["@field_join_string"]="";
this.form.attr("value",_15f9);
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
dojo.declare("plugins.codecs.XMLCodecPane",[plugins.codecs.CodecPane],{templateString:"<div class='codec_pane' dojoAttachPoint='containerNode'\r\n\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t><br/\r\n\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t><td rowspan=\"4\" valign=\"top\"><textarea rows=\"4\" name=\"Comment\" class=\"comment\"></textarea></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t><td rowspan=\"3\">&nbsp;</td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Plugin\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"EventType\"\r\n\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" query=\"{Type: 'object'}\" /></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Event&nbsp;Tag</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"EventTag\" style=\"width: 100%;\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Event&nbsp;Container&nbsp;Tag</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"EventContainerTag\" style=\"width: 100%;\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t\t><br/\r\n\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"border: 1px solid #999999;\" width=\"99%\"\r\n\t\t\t><tr\r\n\t\t\t\t><td class=\"matrixMainHeader\">Map Field Names to Terms</td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td style=\"background-color: #f1f1f1;\"\r\n\t\t\t\t\t><div class=\"codec_grid plugin_pane_grid\" dojoAttachPoint=\"field_mapping_grid_node\"></div\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"add_new_row\" dojoAttachEvent=\"onClick: _handleAddNewField\">ADD NEW ROW</button\r\n\t\t\t\t></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: save\">Save Changes</button\r\n\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: cancel\">Cancel Changes</button\r\n\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick: delete2\">Delete Codec</button\r\n\t\t></div\r\n\t></form\r\n></div>\r\n",postMixInProperties:function(){
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
pion.codecs.getHeight=function(){
return pion.codecs.height;
};
pion.codecs.config_store=new dojox.data.XmlStore({url:"/config/codecs"});
pion.codecs.config_store.fetchItemByIdentity=function(_15fe){
pion.codecs.config_store.fetch({query:{"@id":_15fe.identity},onItem:_15fe.onItem,onError:pion.handleFetchError});
};
pion.codecs.config_store.getIdentity=function(item){
return pion.codecs.config_store.getValue(item,"@id");
};
pion.codecs.init=function(){
pion.codecs.selected_pane=null;
pion.codecs.config_accordion=dijit.byId("codec_config_accordion");
var url=dojo.moduleUrl("plugins","codecs.json");
pion.codecs.plugin_data_store=new dojo.data.ItemFileReadStore({url:url});
dojo.subscribe("codec_config_accordion-selectChild",codecPaneSelected);
dojo.subscribe("codec_config_accordion-addChild",codecPaneAdded);
dojo.subscribe("codec_config_accordion-removeChild",codecPaneRemoved);
pion.codecs.createNewPaneFromStore=function(id,_1602){
pion.codecs.config_store.fetch({query:{"@id":id},onItem:function(item){
var _1604=pion.codecs.config_accordion.createNewPaneFromItem(item,pion.codecs.config_store);
if(_1602){
pion.codecs._adjustAccordionSize();
dijit.byId("codec_config_accordion").selectChild(_1604);
}
},onError:pion.getFetchErrorHandler("fetch() called by pion.codecs.createNewPaneFromStore()")});
};
function _1605(items,_1607){
pion.codecs.config_accordion.createPanesFromAllItems(items,pion.codecs.config_store);
};
pion.codecs.config_store.fetch({onComplete:_1605,onError:pion.getFetchErrorHandler("fetch() called by pion.codecs.init()")});
dojo.connect(dojo.byId("add_new_codec_button"),"click",addNewCodec);
};
function addNewCodec(){
var _1608=new plugins.codecs.CodecInitDialog({title:"Add New Codec"});
setTimeout(function(){
dojo.query("input",_1608.domNode)[0].select();
},500);
_1608.show();
_1608.execute=function(_1609){
if(this.execute_already_called){
console.debug("See http://trac.atomiclabs.com/ticket/685.");
return;
}
this.execute_already_called=true;
console.debug(_1609);
var _160a="<PionConfig><Codec>";
for(var tag in _1609){
console.debug("dialogFields[",tag,"] = ",_1609[tag]);
_160a+=pion.makeXmlLeafElement(tag,_1609[tag]);
}
if(plugins.codecs[_1609.Plugin]&&plugins.codecs[_1609.Plugin].custom_post_data){
_160a+=plugins.codecs[_1609.Plugin].custom_post_data;
}
_160a+="</Codec></PionConfig>";
console.debug("post_data: ",_160a);
dojo.rawXhrPost({url:"/config/codecs",contentType:"text/xml",handleAs:"xml",postData:_160a,load:function(_160c){
var node=_160c.getElementsByTagName("Codec")[0];
var id=node.getAttribute("id");
console.debug("id (from server): ",id);
pion.codecs.createNewPaneFromStore(id,true);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_160a})});
};
};
pion.codecs._adjustAccordionSize=function(){
var _160f=dijit.byId("codec_config_accordion");
var _1610=pion.codecs.selected_pane.getHeight();
dojo.forEach(_160f.getChildren(),function(pane){
_1610+=pane._buttonWidget.getTitleHeight();
});
_160f.resize({h:_1610});
pion.codecs.height=_1610+160;
dijit.byId("main_stack_container").resize({h:pion.codecs.height});
};
function replaceCodecAccordionPane(_1612){
var _1613=pion.codecs.config_store.getValue(_1612.config_item,"Plugin");
var _1614="plugins.codecs."+_1613+"Pane";
var _1615=dojo.getObject(_1614);
if(_1615){
console.debug("found class ",_1614);
var _1616=new _1615({title:_1612.title});
}else{
console.debug("class ",_1614," not found; using plugins.codecs.CodecPane instead.");
var _1616=new plugins.codecs.CodecPane({title:_1612.title});
}
_1616.uuid=_1612.uuid;
_1616.config_item=_1612.config_item;
_1616.initialized=true;
var _1617=dijit.byId("codec_config_accordion");
var idx=_1617.getIndexOfChild(_1612);
_1617.pendingSelection=_1616;
_1617.pendingRemoval=_1612;
_1617.addChild(_1616,idx);
};
function updateCodecPane(pane){
console.debug("Fetching item ",pane.uuid);
var store=pion.codecs.config_store;
store.fetch({query:{"@id":pane.uuid},onItem:function(item){
console.debug("item: ",item);
pane.populateFromConfigItem(item);
},onError:pion.getFetchErrorHandler("fetch() called by codecPaneSelected()")});
pion.codecs._adjustAccordionSize();
dojo.style(pane.containerNode,"overflow","hidden");
};
function codecPaneSelected(pane){
console.debug("Selected "+pane.title);
var _161d=pion.codecs.selected_pane;
if(pane==_161d){
return;
}
var _161e=dijit.byId("codec_config_accordion");
if(_161d&&dojo.hasClass(_161d.domNode,"unsaved_changes")){
var _161f=new dijit.Dialog({title:"Warning: unsaved changes"});
_161f.attr("content","Please save or cancel unsaved changes before selecting another Codec.");
_161f.show();
setTimeout(function(){
_161e.selectChild(_161d);
},500);
return;
}
setTimeout(function(){
if(_161e.pendingRemoval){
_161e.removeChild(_161e.pendingRemoval);
_161e.pendingRemoval=false;
}
if(!pane.initialized){
replaceCodecAccordionPane(pane);
}else{
pion.codecs.selected_pane=pane;
updateCodecPane(pane);
}
},_161e.duration+100);
};
function codecPaneAdded(pane){
console.debug("Added "+pane.title);
var _1621=dijit.byId("codec_config_accordion");
setTimeout(function(){
if(_1621.pendingSelection){
_1621.selectChild(_1621.pendingSelection);
_1621.pendingSelection=false;
}
},_1621.duration);
};
function codecPaneRemoved(pane){
console.debug("Removed "+pane.title);
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
pion.terms.store.fetchItemByIdentity=function(_1623){
pion.terms.store.fetch({query:{"@id":_1623.identity},onItem:_1623.onItem,onError:pion.handleFetchError});
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
store.fetch({onItem:function(item,_1627){
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
var _1630=store.getValues(item,"Comparison");
for(var i=0;i<_1630.length;++i){
var _1632={ID:_this.comparison_store.next_id++,Term:store.getValue(_1630[i],"Term"),Type:store.getValue(_1630[i],"Type"),MatchAllValues:plugins.reactors.FilterReactor.getBool(store,_1630[i],"MatchAllValues")};
if(store.hasAttribute(_1630[i],"Value")){
_1632.Value=store.getValue(_1630[i],"Value");
}
_this.comparison_store.newItem(_1632);
}
},onComplete:function(){
_this.updateNamedCustomPutData("custom_put_data_from_config");
_this.onDonePopulatingComparisonStore();
},onError:pion.handleFetchError});
},_updateCustomData:function(){
this.custom_put_data_from_config=this.custom_put_data_from_comparison_store;
},_insertCustomData:function(){
this.put_data+=this.custom_put_data_from_config;
},updateNamedCustomPutData:function(_1633){
var _1634="";
var _this=this;
var store=this.comparison_store;
store.fetch({onItem:function(item){
_1634+="<Comparison>";
_1634+="<Term>"+store.getValue(item,"Term")+"</Term>";
_1634+="<Type>"+store.getValue(item,"Type")+"</Type>";
if(store.hasAttribute(item,"Value")){
_1634+=pion.makeXmlLeafElement("Value",store.getValue(item,"Value"));
}
_1634+="<MatchAllValues>"+store.getValue(item,"MatchAllValues")+"</MatchAllValues>";
_1634+="</Comparison>";
},onComplete:function(){
_this[_1633]=_1634;
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
this.comparison_grid_layout=[{defaultCell:{width:8,editable:true,type:dojox.grid.cells._Widget,styles:"text-align: right;"},rows:[{field:"Term",name:"Term",width:20,type:pion.widgets.TermTextCell},{field:"Type",name:"Comparison",width:15,widgetClass:pion.widgets.SimpleSelect,widgetProps:{store:pion.reactors.comparison_type_store,query:{category:"generic"}}},{field:"Value",name:"Value",width:"auto",formatter:pion.xmlCellFormatter},{field:"MatchAllValues",name:"Match All",width:3,type:dojox.grid.cells.Bool},{name:"Delete",styles:"align: center;",width:3,editable:false,formatter:pion.makeDeleteButton}]}];
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
plugins.reactors.FilterReactor.getBool=function(store,item,_163f){
if(store.hasAttribute(item,_163f)){
return store.getValue(item,_163f).toString()=="true";
}else{
return plugins.reactors.FilterReactor.grid_option_defaults[_163f];
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
dojo.forEach(store.getValues(item,"Transformation"),function(_1646){
var _1647={ID:_this.transformation_store.next_id++,Term:store.getValue(_1646,"Term"),Type:store.getValue(_1646,"Type")};
if(_1647.Type=="Lookup"){
_1647.Value="<button dojoType=dijit.form.Button class=\"edit\">edit Lookup</button>";
_1647.LookupTerm=store.getValue(_1646,"LookupTerm");
pion.initOptionalValue(store,_1646,_1647,"Match");
pion.initOptionalValue(store,_1646,_1647,"Format");
pion.initOptionalValue(store,_1646,_1647,"DefaultAction","leave-undefined");
pion.initOptionalValue(store,_1646,_1647,"DefaultValue");
_1647.Lookup=dojo.map(store.getValues(_1646,"Lookup"),function(_1648){
var _1649={Key:store.getValue(_1648,"@key").toString(),Value:store.getValue(_1648,"text()").toString()};
return _1649;
});
}else{
if(_1647.Type=="Rules"){
_1647.Value="<button dojoType=dijit.form.Button class=\"edit\">edit Rules</button>";
_1647.StopOnFirstMatch=plugins.reactors.TransformReactor.getBool(store,_1646,"StopOnFirstMatch");
_1647.Rule=dojo.map(store.getValues(_1646,"Rule"),function(rule){
var _164b={Term:store.getValue(rule,"Term").toString(),Type:store.getValue(rule,"Type").toString(),SetValue:store.getValue(rule,"SetValue").toString()};
if(store.hasAttribute(rule,"Value")){
_164b.Value=store.getValue(rule,"Value").toString();
}
return _164b;
});
}else{
if(_1647.Type=="Regex"){
_1647.Value="<button dojoType=dijit.form.Button class=\"edit\">edit Regex</button>";
_1647.SourceTerm=store.getValue(_1646,"SourceTerm");
_1647.Regex=dojo.map(store.getValues(_1646,"Regex"),function(regex){
var _164d={Format:store.getValue(regex,"text()").toString(),Exp:store.getValue(regex,"@exp").toString()};
return _164d;
});
}else{
_1647.Value=store.getValue(_1646,"Value");
}
}
}
_this.transformation_store.newItem(_1647);
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
},updateNamedCustomPutData:function(_164e){
var _164f="";
var _this=this;
var _1651=this.transformation_store;
_1651.fetch({onItem:function(item){
_164f+="<Transformation>";
_164f+="<Term>"+_1651.getValue(item,"Term")+"</Term>";
_164f+="<Type>"+_1651.getValue(item,"Type")+"</Type>";
var type=_1651.getValue(item,"Type");
if(type=="Lookup"){
_164f+=pion.makeXmlLeafElementFromItem(_1651,item,"LookupTerm");
_164f+=pion.makeXmlLeafElementFromItem(_1651,item,"Match");
_164f+=pion.makeXmlLeafElementFromItem(_1651,item,"Format");
_164f+=pion.makeXmlLeafElementFromItem(_1651,item,"DefaultAction");
_164f+=pion.makeXmlLeafElementFromItem(_1651,item,"DefaultValue");
dojo.forEach(_1651.getValues(item,"Lookup"),function(_1654){
_164f+="<Lookup key=\""+pion.escapeXml(_1654.Key)+"\">"+pion.escapeXml(_1654.Value)+"</Lookup>";
});
}else{
if(type=="Rules"){
_164f+=pion.makeXmlLeafElement("StopOnFirstMatch",plugins.reactors.TransformReactor.getBool(_1651,item,"StopOnFirstMatch").toString());
dojo.forEach(_1651.getValues(item,"Rule"),function(rule){
_164f+="<Rule>";
_164f+=pion.makeXmlLeafElement("Term",rule.Term);
_164f+=pion.makeXmlLeafElement("Type",rule.Type);
if("Value" in rule){
_164f+=pion.makeXmlLeafElement("Value",rule.Value);
}
_164f+=pion.makeXmlLeafElement("SetValue",rule.SetValue);
_164f+="</Rule>";
});
}else{
if(type=="Regex"){
_164f+=pion.makeXmlLeafElement("SourceTerm",_1651.getValue(item,"SourceTerm"));
dojo.forEach(_1651.getValues(item,"Regex"),function(regex){
_164f+="<Regex exp=\""+pion.escapeXml(regex.Exp)+"\">"+pion.escapeXml(regex.Format)+"</Regex>";
});
}else{
_164f+=pion.makeXmlLeafElement("Value",_1651.getValue(item,"Value"));
}
}
}
_164f+="</Transformation>";
},onComplete:function(){
_this[_164e]=_164f;
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
var _165c=new plugins.reactors.TransformReactor.LookupConfigurationDialog({reactor:_this.reactor,transformation_store:this.store,transformation_item:this.getItem(e.rowIndex)});
_165c.show();
_165c.save_button.onClick=function(){
return _165c.isValid();
};
}else{
if(type=="Rules"){
var _165c=new plugins.reactors.TransformReactor.RulesConfigurationDialog({reactor:_this.reactor,transformation_store:this.store,transformation_item:this.getItem(e.rowIndex)});
_165c.show();
_165c.save_button.onClick=function(){
return _165c.isValid();
};
}else{
if(type=="Regex"){
var _165c=new plugins.reactors.TransformReactor.RegexConfigurationDialog({reactor:_this.reactor,transformation_store:this.store,transformation_item:this.getItem(e.rowIndex)});
_165c.show();
_165c.save_button.onClick=function(){
return _165c.isValid();
};
}
}
}
}
}
});
this.transformation_grid.connect(this.transformation_grid,"onCellFocus",function(cell,_165e){
if(cell.field=="Type"){
var _this=this;
this.connect(cell.getEditNode(_165e),"change",function(){
_this.edit.apply();
});
}
});
this.transformation_grid.connect(this.transformation_grid,"onStartEdit",function(cell,_1661){
switch(cell.field){
case "Type":
this.pre_edit_type=this.store.getValue(this.getItem(_1661),"Type");
break;
default:
}
});
this.transformation_grid.connect(this.transformation_grid,"onApplyCellEdit",function(value,_1663,_1664){
switch(_1664){
case "Type":
if(value!=this.pre_edit_type){
var _1665=(value=="AssignTerm");
this.layout.setColumnVisibility(this.value_text_column_index,!_1665);
this.layout.setColumnVisibility(this.value_term_column_index,_1665);
var _1666=(value=="Lookup"||value=="Rules"||value=="Regex");
if(_1666){
this.store.setValue(this.getItem(_1663),"Value","<button dojoType=dijit.form.Button class=\"edit\">edit "+value+"</button>");
}else{
this.store.unsetAttribute(this.getItem(_1663),"Value");
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
this.transformation_grid.canEdit=function(cell,_166d){
switch(cell.field){
case "Value":
var item=this.getItem(_166d);
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
plugins.reactors.TransformReactor.getBool=function(store,item,_1672){
if(store.hasAttribute(item,_1672)){
return store.getValue(item,_1672).toString()=="true";
}else{
return plugins.reactors.TransformReactor.grid_option_defaults[_1672];
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
},execute:function(_1674){
if(this.execute_already_called){
console.debug("See http://trac.atomiclabs.com/ticket/685.");
return;
}
this.execute_already_called=true;
var _1675=this.transformation_store;
var _1676=this.transformation_item;
var _1677=this.lookup_store;
var _1678=[];
for(var i=0;i<this.lookup_grid.rowCount;++i){
var item=this.lookup_grid.getItem(i);
var _167b={Key:_1677.getValue(item,"Key"),Value:_1677.getValue(item,"Value")};
_1678.push(_167b);
}
_1675.setValues(_1676,"Lookup",_1678);
for(var tag in _1674){
_1675.setValue(_1676,tag,_1674[tag]);
}
this.reactor.updateNamedCustomPutData("custom_put_data_from_grid_stores");
},_populateLookupStore:function(){
var _this=this;
dojo.forEach(this.transformation_store.getValues(this.transformation_item,"Lookup"),function(_167e){
_this.lookup_store.newItem(dojo.mixin(_167e,{ID:_this.lookup_store.next_id++}));
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
var _1683=new plugins.reactors.TransformReactor.KeyValuePairImportDialog({title:"Key Value Pairs in XML Format to Import",instructions:"Enter key value pairs in the following format, using standard escape sequences:",example:"&lt;Lookup key=\"index-1\"&gt;NASDAQ&lt;/Lookup&gt\n...\n&lt;Lookup key=\"index-n\"&gt;S&amp;amp;P 500&lt;/Lookup&gt"});
_1683.show();
_1683.execute=function(_1684){
if(this.execute_already_called){
console.debug("See http://trac.atomiclabs.com/ticket/685.");
return;
}
this.execute_already_called=true;
var _1685="<PionConfig>"+this.XML_text_area.value+"</PionConfig>";
var _1686=_1685.replace(/>\s*/g,">");
if(dojo.isIE){
var _1687=dojox.data.dom.createDocument();
_1687.loadXML(_1686);
}else{
var _1688=new DOMParser();
var _1687=_1688.parseFromString(_1686,"text/xml");
}
dojo.forEach(_1687.getElementsByTagName("Lookup"),function(_1689){
var _168a=_1689.getAttribute("key");
var _168b=dojo.isIE?_1689.childNodes[0].nodeValue:_1689.textContent;
_this.lookup_store.newItem({ID:_this.lookup_store.next_id++,Key:_168a,Value:_168b});
});
};
},_onExportXmlKeyValuePairs:function(){
var _168c=this.lookup_store;
var _168d="";
for(var i=0;i<this.lookup_grid.rowCount;++i){
var item=this.lookup_grid.getItem(i);
var key=_168c.getValue(item,"Key");
var value=_168c.getValue(item,"Value");
var _1692="<Lookup key=\""+pion.escapeXml(key)+"\">"+pion.escapeXml(value)+"</Lookup>";
_168d+=pion.escapeXml(_1692)+"<br />";
}
var _1693=new dijit.Dialog({title:"Exported Key Value Pairs in XML Format",style:"width: 600px"});
_1693.attr("content",_168d);
_1693.show();
},_onImportCsvKeyValuePairs:function(e){
var _this=this;
var _1696=new plugins.reactors.TransformReactor.KeyValuePairImportDialog({title:"Key Value Pairs in CSV Format to Import",instructions:"Enter key value pairs in CSV format.  Example:",example:"A,yes & no\nB,\"X, Y and Z\"\nC,\"the one with a \"\"D\"\" in it\"\nD,\" quoting optional here \"\n..."});
_1696.show();
_1696.execute=function(_1697){
if(this.execute_already_called){
console.debug("See http://trac.atomiclabs.com/ticket/685.");
return;
}
this.execute_already_called=true;
var lines=this.XML_text_area.value.split("\n");
dojo.forEach(lines,function(line){
if(results=line.match(/^"(.*)","(.*)"$/)){
var _169a=results[1].replace(/""/g,"\"");
var _169b=results[2].replace(/""/g,"\"");
}else{
if(results=line.match(/^([^,"]*),"(.*)"$/)){
var _169a=results[1];
var _169b=results[2].replace(/""/g,"\"");
}else{
if(results=line.match(/^"(.*)",([^,"]*)$/)){
var _169a=results[1].replace(/""/g,"\"");
var _169b=results[2];
}else{
if(results=line.match(/^([^,"]*),([^,"]*)$/)){
var _169a=results[1];
var _169b=results[2];
}else{
return;
}
}
}
}
_this.lookup_store.newItem({ID:_this.lookup_store.next_id++,Key:_169a,Value:_169b});
});
};
},_onExportCsvKeyValuePairs:function(){
var _169c=this.lookup_store;
var _169d="";
for(var i=0;i<this.lookup_grid.rowCount;++i){
var item=this.lookup_grid.getItem(i);
var key=_169c.getValue(item,"Key").toString();
var value=_169c.getValue(item,"Value").toString();
var _16a2="\""+key.replace(/"/g,"\"\"")+"\",\""+value.replace(/"/g,"\"\"")+"\"";
_169d+=pion.escapeXml(_16a2)+"<br />";
}
var _16a3=new dijit.Dialog({title:"Exported Key Value Pairs in CSV Format",style:"width: 600px"});
_16a3.attr("content",_169d);
_16a3.show();
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
this.rule_grid_layout=[{defaultCell:{width:8,editable:true,type:dojox.grid.cells._Widget,styles:"text-align: right;"},rows:[{field:"Term",name:"Term",width:14,type:pion.widgets.TermTextCell},{field:"Type",name:"Comparison",width:10,widgetClass:pion.widgets.SimpleSelect,widgetProps:{store:pion.reactors.comparison_type_store,query:{category:"generic"}}},{field:"Value",name:"Value",width:"auto",formatter:pion.xmlCellFormatter},{field:"SetValue",name:"Set Value",width:"auto",formatter:pion.xmlCellFormatter},{name:"Insert Above",styles:"align: center;",width:3,editable:false,formatter:pion.makeInsertAboveButton},{name:"Delete",styles:"align: center;",width:3,editable:false,formatter:pion.makeDeleteButton}]}];
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
var _16a5=[];
var _16a6=[];
for(var i=e.rowIndex;i<this.rowCount;++i){
var item=this.getItem(i);
var _16a9={Term:this.store.getValue(item,"Term"),Type:this.store.getValue(item,"Type"),SetValue:this.store.getValue(item,"SetValue")};
if(this.store.hasAttribute(item,"Value")){
_16a9.Value=this.store.getValue(item,"Value");
}
_16a5.push(_16a9);
_16a6.push(item);
}
var _this=this;
dojo.forEach(_16a6,function(item){
_this.store.deleteItem(item);
});
this.store.newItem({ID:this.store.next_id++});
dojo.forEach(_16a5,function(item){
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
},execute:function(_16b1){
if(this.execute_already_called){
console.debug("See http://trac.atomiclabs.com/ticket/685.");
return;
}
this.execute_already_called=true;
var _16b2=this.transformation_store;
var _16b3=this.transformation_item;
var _16b4=this.rule_store;
var _16b5=[];
for(var i=0;i<this.rule_grid.rowCount;++i){
var item=this.rule_grid.getItem(i);
var _16b8={Term:_16b4.getValue(item,"Term"),Type:_16b4.getValue(item,"Type"),SetValue:_16b4.getValue(item,"SetValue")};
pion.initOptionalValue(_16b4,item,_16b8,"Value");
_16b5.push(_16b8);
}
_16b2.setValue(_16b3,"StopOnFirstMatch",dojo.indexOf(_16b1.options,"StopOnFirstMatch")!=-1);
_16b2.setValues(_16b3,"Rule",_16b5);
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
this.regex_grid_layout=[{defaultCell:{width:8,editable:true,type:dojox.grid.cells._Widget,styles:"text-align: right;"},rows:[{field:"Exp",name:"Regex",width:"auto",formatter:pion.xmlCellFormatter},{field:"Format",name:"Format",width:"auto",formatter:pion.xmlCellFormatter},{name:"Insert Above",styles:"align: center;",width:3,editable:false,formatter:pion.makeInsertAboveButton},{name:"Delete",styles:"align: center;",width:3,editable:false,formatter:pion.makeDeleteButton}]}];
this.regex_grid=new dojox.grid.DataGrid({store:this.regex_store,structure:this.regex_grid_layout,singleClickEdit:true,autoHeight:true},document.createElement("div"));
this.regex_grid_node.appendChild(this.regex_grid.domNode);
this.regex_grid.startup();
this.regex_grid.connect(this.regex_grid,"onCellClick",function(e){
if(e.cell.name=="Delete"){
this.store.deleteItem(this.getItem(e.rowIndex));
}else{
if(e.cell.name=="Insert Above"){
var _16bc=[];
var _16bd=[];
for(var i=e.rowIndex;i<this.rowCount;++i){
var item=this.getItem(i);
var _16c0={Exp:this.store.getValue(item,"Exp"),Format:this.store.getValue(item,"Format")};
_16bc.push(_16c0);
_16bd.push(item);
}
var _this=this;
dojo.forEach(_16bd,function(item){
_this.store.deleteItem(item);
});
this.store.newItem({ID:this.store.next_id++});
dojo.forEach(_16bc,function(item){
_this.store.newItem(dojo.mixin(item,{ID:_this.store.next_id++}));
});
}
}
});
},execute:function(_16c4){
if(this.execute_already_called){
console.debug("See http://trac.atomiclabs.com/ticket/685.");
return;
}
this.execute_already_called=true;
var _16c5=this.transformation_store;
var _16c6=this.transformation_item;
var _16c7=this.regex_store;
var _16c8=[];
for(var i=0;i<this.regex_grid.rowCount;++i){
var item=this.regex_grid.getItem(i);
var _16cb={Exp:_16c7.getValue(item,"Exp"),Format:_16c7.getValue(item,"Format")};
_16c8.push(_16cb);
}
_16c5.setValue(_16c6,"SourceTerm",_16c4.SourceTerm);
_16c5.setValues(_16c6,"Regex",_16c8);
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
dojo.declare("plugins.databases.DatabasePane",[dijit.layout.ContentPane,dijit._Templated],{templateString:"<div class='database_pane' dojoAttachPoint='containerNode'\r\n\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t><br /><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t><td rowspan=\"4\" valign=\"top\"><textarea rows=\"4\" name=\"Comment\" class=\"comment\" dojoAttachEvent=\"onChange: markAsChanged\"></textarea></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t><td rowspan=\"3\">&nbsp;</td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Plugin\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Filename</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Filename\" style=\"width: 100%;\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: save\">Save Changes</button\r\n\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: cancel\">Cancel Changes</button\r\n\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick: delete2\">Delete Database</button\r\n\t\t></div\r\n\t></form\r\n></div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
},getHeight:function(){
return 200;
},populateFromConfigItem:function(item){
var store=pion.databases.config_store;
var _16d0={};
var _16d1=store.getAttributes(item);
for(var i=0;i<_16d1.length;++i){
if(_16d1[i]!="tagName"&&_16d1[i]!="childNodes"){
_16d0[_16d1[i]]=store.getValue(item,_16d1[i]).toString();
}
}
console.dir(_16d0);
this.form.attr("value",_16d0);
var _16d3=dojo.query("textarea.comment",this.form.domNode)[0];
_16d3.value=_16d0.Comment;
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
var _16d5=this.form.attr("value");
var _16d6=dojo.query("textarea.comment",this.form.domNode)[0];
_16d5.Comment=_16d6.value;
this.put_data="<PionConfig><Database>";
for(var tag in _16d5){
if(tag!="@id"){
console.debug("config[",tag,"] = ",_16d5[tag]);
this.put_data+=pion.makeXmlLeafElement(tag,_16d5[tag]);
}
}
if(this._insertCustomData){
this._insertCustomData();
}
this.put_data+="</Database></PionConfig>";
console.debug("put_data: ",this.put_data);
_this=this;
dojo.rawXhrPut({url:"/config/databases/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:this.put_data,load:function(_16d8){
console.debug("response: ",_16d8);
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
dojo.xhrDelete({url:"/config/databases/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_16da,_16db){
console.debug("xhrDelete for url = /config/databases/"+this.uuid,"; HTTP status code: ",_16db.xhr.status);
dijit.byId("database_config_accordion").forward();
dijit.byId("database_config_accordion").removeChild(_this);
pion.databases._adjustAccordionSize();
return _16da;
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
pion.databases.config_store.fetchItemByIdentity=function(_16dc){
pion.databases.config_store.fetch({query:{"@id":_16dc.identity},onItem:_16dc.onItem,onError:pion.handleFetchError});
};
pion.databases.config_store.getIdentity=function(item){
return pion.databases.config_store.getValue(item,"@id");
};
pion.databases._adjustAccordionSize=function(){
var _16de=dijit.byId("database_config_accordion");
var _16df=pion.databases.selected_pane.getHeight();
dojo.forEach(_16de.getChildren(),function(pane){
_16df+=pane._buttonWidget.getTitleHeight();
});
_16de.resize({h:_16df});
pion.databases.height=_16df+160;
dijit.byId("main_stack_container").resize({h:pion.databases.height});
};
pion.databases.init=function(){
pion.databases.selected_pane=null;
pion.databases.config_accordion=dijit.byId("database_config_accordion");
pion.databases.getAllDatabasesInUIDirectory=function(){
var d=new dojo.Deferred();
var store=new dojox.data.XmlStore({url:"/config/databases/plugins"});
store.fetch({onComplete:function(items){
var _16e4=dojo.map(items,function(item){
return store.getValue(item,"Plugin").toString();
});
d.callback(_16e4);
}});
return d;
};
var _16e6=function(_16e7){
var d=new dojo.Deferred();
plugin_data_store_items=[];
dojo.forEach(_16e7,function(_16e9){
if(dojo.indexOf(pion.plugins.available_plugins,_16e9)!=-1){
var _16ea=pion.plugins.getPluginPrototype("plugins.databases",_16e9,"/plugins/databases");
plugin_data_store_items.push({plugin:_16e9,label:_16ea.label});
}
pion.databases.plugin_data_store=new dojo.data.ItemFileWriteStore({data:{identifier:"plugin",items:plugin_data_store_items}});
});
d.callback();
return d;
};
var _16eb=function(){
if(file_protocol){
pion.databases._adjustAccordionSize();
}else{
pion.databases.config_store.fetch({onComplete:function(items,_16ed){
pion.databases.config_accordion.createPanesFromAllItems(items,pion.databases.config_store);
},onError:pion.handleFetchError});
}
};
pion.plugins.initAvailablePluginList().addCallback(pion.databases.getAllDatabasesInUIDirectory).addCallback(_16e6).addCallback(_16eb);
pion.databases._replaceAccordionPane=function(_16ee){
var _16ef=pion.databases.config_store.getValue(_16ee.config_item,"Plugin");
var _16f0="plugins.databases."+_16ef+"Pane";
var _16f1=dojo.getObject(_16f0);
if(_16f1){
console.debug("found class ",_16f0);
var _16f2=new _16f1({title:_16ee.title});
}else{
console.debug("class ",_16f0," not found; using plugins.databases.DatabasePane instead.");
var _16f2=new plugins.databases.DatabasePane({title:_16ee.title});
}
_16f2.uuid=_16ee.uuid;
_16f2.config_item=_16ee.config_item;
_16f2.initialized=true;
var _16f3=dijit.byId("database_config_accordion");
var idx=_16f3.getIndexOfChild(_16ee);
_16f3.pendingSelection=_16f2;
_16f3.pendingRemoval=_16ee;
_16f3.addChild(_16f2,idx);
};
pion.databases._updatePane=function(pane){
console.debug("Fetching item ",pane.uuid);
var store=pion.databases.config_store;
store.fetch({query:{"@id":pane.uuid},onItem:function(item){
console.debug("item: ",item);
pane.populateFromConfigItem(item);
},onError:pion.handleFetchError});
pion.databases._adjustAccordionSize();
dojo.style(pane.containerNode,"overflow","hidden");
};
function _16f8(pane){
console.debug("Selected "+pane.title);
var _16fa=pion.databases.selected_pane;
if(pane==_16fa){
return;
}
var _16fb=dijit.byId("database_config_accordion");
if(_16fa&&dojo.hasClass(_16fa.domNode,"unsaved_changes")){
var _16fc=new dijit.Dialog({title:"Warning: unsaved changes"});
_16fc.attr("content","Please save or cancel unsaved changes before selecting another Database.");
_16fc.show();
setTimeout(function(){
_16fb.selectChild(_16fa);
},500);
return;
}
setTimeout(function(){
if(_16fb.pendingRemoval){
_16fb.removeChild(_16fb.pendingRemoval);
_16fb.pendingRemoval=false;
}
if(!pane.initialized){
pion.databases._replaceAccordionPane(pane);
}else{
pion.databases.selected_pane=pane;
pion.databases._updatePane(pane);
}
},_16fb.duration+100);
};
function _16fd(pane){
var _16ff=dijit.byId("database_config_accordion");
setTimeout(function(){
if(_16ff.pendingSelection){
_16ff.selectChild(_16ff.pendingSelection);
_16ff.pendingSelection=false;
}
},_16ff.duration);
};
function _1700(pane){
};
dojo.subscribe("database_config_accordion-selectChild",_16f8);
dojo.subscribe("database_config_accordion-addChild",_16fd);
dojo.subscribe("database_config_accordion-removeChild",_1700);
pion.databases.createNewPaneFromStore=function(id,_1703){
pion.databases.config_store.fetch({query:{"@id":id},onItem:function(item){
var _1705=pion.databases.config_accordion.createNewPaneFromItem(item,pion.databases.config_store);
if(_1703){
pion.databases._adjustAccordionSize();
dijit.byId("database_config_accordion").selectChild(_1705);
}
},onError:pion.handleFetchError});
};
function _1706(id){
var _1708=dijit.byId("database_config_accordion").getChildren();
for(var i=0;i<_1708.length;++i){
if(pion.databases.config_store.getValue(_1708[i].config_item,"@id")==id){
return true;
}
}
return false;
};
function _170a(name){
var _170c=dijit.byId("database_config_accordion").getChildren();
for(var i=0;i<_170c.length;++i){
if(_170c[i].title==name){
return true;
}
}
return false;
};
function _170e(){
var _170f=new plugins.databases.SelectPluginDialog({title:"Select Database Plugin"});
_170f.show();
_170f.execute=function(_1710){
if(this.execute_already_called){
console.debug("See http://trac.atomiclabs.com/ticket/685.");
return;
}
this.execute_already_called=true;
if(pion.key_service_running&&plugins.databases[_1710.Plugin]&&plugins.databases[_1710.Plugin].edition=="Enterprise"){
pion.about.checkKeyStatus({success_callback:function(){
_1711(_1710.Plugin);
}});
}else{
_1711(_1710.Plugin);
}
};
};
function _1711(_1712){
var title="Add New "+_1712;
var _1714="plugins.databases."+_1712+"InitDialog";
var _1715=dojo.getObject(_1714);
if(_1715){
console.debug("found class ",_1714);
var _1716=new _1715({title:title});
}else{
console.debug("class ",_1714," not found; using plugins.databases.DatabaseInitDialog instead.");
var _1716=new plugins.databases.DatabaseInitDialog({title:title});
}
_1716.attr("value",{Plugin:_1712});
setTimeout(function(){
dojo.query("input",_1716.domNode)[0].select();
},500);
_1716.show();
_1716.execute=function(_1717){
if(this.execute_already_called){
console.debug("See http://trac.atomiclabs.com/ticket/685.");
return;
}
this.execute_already_called=true;
console.debug(_1717);
var _1718="<PionConfig><Database>";
for(var tag in _1717){
console.debug("dialogFields[",tag,"] = ",_1717[tag]);
_1718+=pion.makeXmlLeafElement(tag,_1717[tag]);
}
if(this._insertCustomData){
this._insertCustomData();
}
_1718+="</Database></PionConfig>";
console.debug("post_data: ",_1718);
dojo.rawXhrPost({url:"/config/databases",contentType:"text/xml",handleAs:"xml",postData:_1718,load:function(_171a){
var node=_171a.getElementsByTagName("Database")[0];
var id=node.getAttribute("id");
console.debug("id (from server): ",id);
pion.databases.createNewPaneFromStore(id,true);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1718})});
};
};
dojo.connect(dojo.byId("add_new_database_button"),"click",_170e);
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
var _1725=store.getValues(item,"Comparison");
for(var i=0;i<_1725.length;++i){
var _1727={ID:_this.comparison_store.next_id++,Term:store.getValue(_1725[i],"Term"),Type:store.getValue(_1725[i],"Type"),MatchAllValues:_this.getOptionalBool(store,_1725[i],"MatchAllValues")};
if(store.hasAttribute(_1725[i],"Value")){
_1727.Value=store.getValue(_1725[i],"Value");
}
_this.comparison_store.newItem(_1727);
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
dojo.forEach(store.getValues(item,"Field"),function(_172b){
var index=store.getValue(_172b,"@index");
var _172d=(index!==undefined&&index!==null);
var _172e=store.getValue(_172b,"@sql");
var _172f=(_172e!==undefined&&_172e!==null);
var _1730={ID:_this.field_mapping_store.next_id++,Field:store.getValue(_172b,"text()"),Term:store.getValue(_172b,"@term")};
if(_172d){
if(index=="false"||index=="true"||index=="unique"){
_1730.IndexOption=index;
}else{
_1730.IndexOption="custom";
}
_1730.Index=index;
}else{
_1730.IndexOption="false";
}
if(_172f){
_1730.SqlType=_172e;
}
_this.field_mapping_store.newItem(_1730);
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
},updateNamedCustomPutData:function(_1731){
var _1732="";
var _this=this;
var _1734=this.comparison_store;
var _1735=this.field_mapping_store;
_1734.fetch({onItem:function(item){
_1732+="<Comparison>";
_1732+="<Term>"+_1734.getValue(item,"Term")+"</Term>";
_1732+="<Type>"+_1734.getValue(item,"Type")+"</Type>";
if(_1734.hasAttribute(item,"Value")){
_1732+=pion.makeXmlLeafElement("Value",_1734.getValue(item,"Value"));
}
_1732+="<MatchAllValues>"+_1734.getValue(item,"MatchAllValues")+"</MatchAllValues>";
_1732+="</Comparison>";
},onComplete:function(){
_1735.fetch({onItem:function(item){
_1732+="<Field term=\""+_1735.getValue(item,"Term")+"\"";
var index=_1735.getValue(item,"Index");
var _1739=_1735.getValue(item,"IndexOption");
if(_1739=="custom"){
_1732+=" index=\""+index+"\"";
}else{
if(_1739=="false"){
if(index=="false"){
_1732+=" index=\"false\"";
}
}else{
_1732+=" index=\""+_1739+"\"";
}
}
if(_1735.hasAttribute(item,"SqlType")){
_1732+=" sql=\""+_1735.getValue(item,"SqlType")+"\"";
}
_1732+=">";
_1732+=pion.escapeXml(_1735.getValue(item,"Field"));
_1732+="</Field>";
},onComplete:function(){
_this[_1731]=_1732;
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
var _173a=new dojox.grid.DataGrid({store:this.field_mapping_store,structure:plugins.reactors.DatabaseOutputReactorDialog.grid_layout,singleClickEdit:true,autoHeight:true},document.createElement("div"));
this.field_mapping_grid_node.appendChild(_173a.domNode);
_173a.startup();
_173a.connect(_173a,"onCellClick",function(e){
if(e.cell.name=="Delete"){
this.store.deleteItem(this.getItem(e.rowIndex));
}
});
},_updateCustomPostDataFromFieldMappingStore:function(){
var _173c="";
var _this=this;
var store=this.field_mapping_store;
store.fetch({onItem:function(item){
_173c+="<Field term=\""+store.getValue(item,"Term")+"\"";
var _1740=store.getValue(item,"IndexOption");
if(_1740!="false"){
_173c+=" index=\""+_1740+"\"";
}
_173c+=">";
_173c+=pion.escapeXml(store.getValue(item,"Field"));
_173c+="</Field>";
},onComplete:function(){
_this.custom_post_data_from_field_mapping_store=_173c;
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
this.comparison_grid_layout=[{defaultCell:{width:8,editable:true,type:dojox.grid.cells._Widget,styles:"text-align: right;"},rows:[{field:"Term",name:"Term",width:20,type:pion.widgets.TermTextCell},{field:"Type",name:"Comparison",width:15,widgetClass:pion.widgets.SimpleSelect,widgetProps:{store:pion.reactors.comparison_type_store,query:{category:"generic"}}},{field:"Value",name:"Value",width:"auto",formatter:pion.xmlCellFormatter},{field:"MatchAllValues",name:"Match All",width:3,type:dojox.grid.cells.Bool},{name:"Delete",styles:"align: center;",width:3,editable:false,formatter:pion.makeDeleteButton}]}];
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
var _1746=new dojox.grid.DataGrid({store:this.reactor.field_mapping_store,structure:plugins.reactors.DatabaseOutputReactorDialog.grid_layout,singleClickEdit:true,autoHeight:true},document.createElement("div"));
this.field_mapping_grid_node.appendChild(_1746.domNode);
_1746.startup();
_1746.connect(_1746,"onCellClick",function(e){
if(e.cell.name=="Delete"){
this.store.deleteItem(this.getItem(e.rowIndex));
}
});
_1746.canEdit=function(cell,_1749){
switch(cell.name){
case "Index":
var item=this.getItem(_1749);
var _174b=this.store.getValue(item,"IndexOption").toString();
return _174b!="custom";
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
var _174e=false;
var _174f=this.reactor.field_mapping_store;
_174f.fetch({onItem:function(item){
var index=_174f.getValue(item,"Index");
var _1752=_174f.getValue(item,"IndexOption");
if(_1752=="unique"||_1752=="custom"){
_174e=true;
}
},onComplete:function(){
if(_174e){
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
plugins.reactors.DatabaseOutputReactorDialog.grid_layout=[{defaultCell:{editable:true,type:dojox.grid.cells._Widget},rows:[{field:"Field",name:"Database Column Name",width:20,widgetClass:dijit.form.ValidationTextBox,widgetProps:{regExp:"[a-zA-Z][\\w]*",required:"true",invalidMessage:"Illegal database column name"}},{field:"Term",name:"Term",width:"auto",type:pion.widgets.TermTextCell},{field:"IndexOption",name:"Index",styles:"text-align: center;",width:4,type:dojox.grid.cells.Select,options:["true","false","unique"]},{name:"Delete",styles:"align: center;",width:3,editable:false,formatter:function(){
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
var _1758=store.getValues(item,"CopyTerm");
for(var i=0;i<_1758.length;++i){
var _175a={ID:_this.copy_term_store.next_id++,Term:_1758[i]};
_this.copy_term_store.newItem(_175a);
}
},onComplete:function(){
_this.updateNamedCustomPutData("custom_put_data_from_config");
_this.onDonePopulatingCopyTermStore();
},onError:pion.handleFetchError});
},_updateCustomData:function(){
this.custom_put_data_from_config=this.custom_put_data_from_copy_term_store;
},_insertCustomData:function(){
this.put_data+=this.custom_put_data_from_config;
},updateNamedCustomPutData:function(_175b){
var _175c="";
var _this=this;
var store=this.copy_term_store;
store.fetch({onItem:function(item){
_175c+=pion.makeXmlLeafElement("CopyTerm",store.getValue(item,"Term"));
},onComplete:function(){
_this[_175b]=_175c;
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
if(!dojo._hasResource["plugins.reactors.PythonReactor"]){
dojo._hasResource["plugins.reactors.PythonReactor"]=true;
dojo.provide("plugins.reactors.PythonReactor");
dojo.declare("plugins.reactors.PythonReactor",[plugins.reactors.Reactor],{postCreate:function(){
this.config.Plugin="PythonReactor";
this.inherited("postCreate",arguments);
this.special_config_elements.push("PythonSource");
var _this=this;
var _1764=pion.reactors.config_store;
_1764.fetch({query:{"@id":this.config["@id"]},onItem:function(item){
if(_1764.hasAttribute(item,"PythonSource")){
var _1766=_1764.getValue(item,"PythonSource");
var _1767=pion.makeXmlLeafElement("PythonSource",_1766);
_this.custom_put_data_from_config=_1767;
}else{
_this.custom_put_data_from_config="";
}
},onError:pion.handleFetchError});
},_insertCustomData:function(){
this.put_data+=this.custom_put_data_from_config;
}});
plugins.reactors.PythonReactor.label="Python Reactor";
dojo.declare("plugins.reactors.PythonReactorDialog",[plugins.reactors.ReactorDialog],{templateString:"<div class=\"dijitDialog reactor_dialog python_reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Python Reactor Configuration</span>\r\n\t\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><!--start div to set padding for top half of dialog-->\r\n\t\t<div class=\"reactor_dialog_top\">\r\n\r\n\t\t\t<!--start reactor header info-->\r\n\t\t\t<div class=\"reactor_name\">\r\n\t\t\t\t<img src=\"/plugins/reactors/processing/PythonReactor/dialog-icon.png\" width=\"17\" height=\"17\" border=\"0\" />\r\n\t\t\t\t&nbsp; Python Reactor\r\n\t\t\t</div>\r\n\t\t\t<div class=\"reactor_cat\">\r\n\t\t\t\t<strong>Name:</strong> PythonReactor\r\n\t\t\t\t&nbsp;&nbsp;&nbsp;\r\n\t\t\t\t<strong>Category:</strong> Processing\r\n\t\t\t</div>\r\n\r\n\t\t\t<div style=\"clear:both;\"></div>\r\n\r\n\t\t\t<p>Manipulate events using the Python programming language.</p>\r\n\t\t\t<!--end reactor header info-->\r\n\r\n\t\t\t<!--start reactor settings-->\r\n\t\t\t<table cellpadding=\"0\" cellspacing=\"5\" border=\"0\"\r\n\t\t\t\t><tr\r\n\t\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Filename:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Filename\" style=\"width: 100%;\"/></td\r\n\t\t\t\t></tr\r\n\t\t\t></table>\r\n\t\t\t<!--end reactor settings-->\r\n\r\n\t\t</div>\r\n\t\t<!--end div to set padding for top half of dialog-->\r\n\r\n\t\t<!--start div to set padding for bottom half of dialog-->\r\n\t\t<div class=\"reactor_dialog_bottom\">\r\n\r\n\t\t\t<label>Python Code:</label>\r\n\t\t\t<br />\r\n\t\t\t<textarea dojoAttachPoint=\"python_text_area\" style=\"width: 100%\" rows=\"8\"></textarea>\r\n\t\t\t<br />\r\n\r\n\t\t\t<!--start connections-->\r\n\t\t\t<div class=\"p_reactor_grid_blocks\">\r\n\t\t\t\t<h2>Connections</h2>\r\n\t\t\t\t<h3>Input Connections</h3>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"reactor_inputs_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t\t<h3>Output Connections</h3>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"reactor_outputs_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t</div>\r\n\t\t\t<!--end connections-->\r\n\r\n\t\t\t<!--start buttons-->\r\n\t\t\t<div class=\"save_cancel_delete\">\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t\t\t</div>\r\n\t\t\t<!--end buttons-->\r\n\r\n\t\t</div>\r\n\t\t<!--end div to set padding for bottom half of dialog-->\r\n\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
var _this=this;
var _1769=pion.reactors.config_store;
_1769.fetch({query:{"@id":this.reactor.config["@id"]},onItem:function(item){
if(_1769.hasAttribute(item,"Filename")){
_this.attr("value",{Filename:_1769.getValue(item,"Filename")});
}
if(_1769.hasAttribute(item,"PythonSource")){
_this.python_text_area.value=_1769.getValue(item,"PythonSource");
}
},onError:pion.handleFetchError});
this.connect(this.python_text_area,"onkeydown",function(e){
if(e.keyCode===dojo.keys.TAB){
if(dojo.isIE){
var range=document.selection.createRange();
var _176d=range.duplicate();
_176d.moveToElementText(this.python_text_area);
_176d.setEndPoint("EndToEnd",range);
var p1=_176d.text.length-range.text.length;
if(range.text.length==0){
var _176f=this.python_text_area.createTextRange();
if(range.boundingLeft==_176f.boundingLeft){
p1+=2;
}
}
var p2=p1+range.text.length;
this.python_text_area.value=this.python_text_area.value.substring(0,p1)+"\t"+this.python_text_area.value.substring(p2);
with(range){
var _1771=this.python_text_area.value.substring(0,p1+1);
var _1772=_1771.replace(/\r/g,"").length+1;
var _1773=_1772;
moveStart("character",_1773);
var temp=this.python_text_area.value.replace(/\r/g,"");
var _1775=(_1773-temp.length)-1;
moveEnd("character",_1775);
select();
}
}else{
var p1=this.python_text_area.selectionStart;
var p2=this.python_text_area.selectionEnd;
this.python_text_area.value=this.python_text_area.value.substring(0,p1)+"\t"+this.python_text_area.value.substring(p2);
this.python_text_area.setSelectionRange(p1+1,p1+1);
}
dojo.stopEvent(e);
}
});
},uninitialize:function(){
this.inherited("uninitialize",arguments);
},_insertCustomData:function(_1776){
var _1777=this.python_text_area.value;
var _1778=pion.makeXmlLeafElement("PythonSource",_1777);
this.put_data+=_1778;
this.reactor.custom_put_data_from_config=_1778;
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
var _1779=dijit.byId("ops_toggle_button");
dojo.connect(_1779.domNode,"click",function(){
if(_1779.checked){
dojo.addClass(dojo.byId("counterBackground"),"hidden");
}else{
dojo.removeClass(dojo.byId("counterBackground"),"hidden");
}
});
var _177a=function(item,hint){
var node=dojo.doc.createElement("div");
node.id=dojo.dnd.getUniqueId();
node.className="dojoDndItem";
node.setAttribute("reactor_type",item.reactor_type);
var _177e=dojo.doc.createElement("img");
node.appendChild(_177e);
_177e.setAttribute("src",item.src);
_177e.setAttribute("width",148);
_177e.setAttribute("height",25);
_177e.setAttribute("alt",item.alt);
return {node:node,data:item,type:["reactor"]};
};
var _177f={collection:collectionReactors,processing:processingReactors,storage:storageReactors};
for(var _1780 in _177f){
_177f[_1780].creator=_177a;
}
var _1781=dojo.query(".dijitAccordionTitle",dojo.byId("sidebarMain")).map(dijit.byNode);
dojo.forEach(_1781,function(_1782){
dojo.addClass(_1782.domNode,_1782.contentWidget["class"]+"Header");
});
var store=pion.reactors.comparison_type_store;
store.fetch({query:{category:"generic"},onItem:function(item){
pion.reactors.generic_comparison_types.push(store.getValue(item,"name"));
}});
pion.reactors.getAllReactorsInUIDirectory=function(){
var d=new dojo.Deferred();
var store=new dojox.data.XmlStore({url:"/config/reactors/plugins"});
store.fetch({onComplete:function(items){
var _1788=dojo.map(items,function(item){
var _178a=store.getValue(item,"Plugin").toString();
var _178b=store.getValue(item,"ReactorType").toString();
return {plugin:_178a,category:_178b};
});
d.callback(_1788);
}});
return d;
};
var _178c=function(_178d){
var d=new dojo.Deferred();
dojo.forEach(_178d,function(_178f){
var _1790=_178f.plugin;
if(dojo.indexOf(pion.plugins.available_plugins,_1790)!=-1){
var _1791=pion.plugins.getPluginPrototype("plugins.reactors",_1790,"/plugins/reactors/"+_178f.category);
pion.reactors.categories[_1790]=_178f.category;
var icon=_178f.category+"/"+_1790+"/icon.png";
var _1793=dojo.moduleUrl("plugins.reactors",icon);
console.debug("icon_url = ",_1793);
_177f[_178f.category].insertNodes(false,[{reactor_type:_1790,src:_1793,alt:_1791["label"]}]);
}
});
d.callback();
return d;
};
pion.plugins.initAvailablePluginList().addCallback(pion.reactors.getAllReactorsInUIDirectory).addCallback(_178c).addCallback(pion.reactors._initConfiguredReactors);
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
var _1794=0;
var _1795=0;
setInterval(function(){
if(!_1779.checked&&pion.current_page=="Reactors"){
dojo.xhrGet({url:"/config/reactors/stats",preventCache:true,handleAs:"xml",timeout:1000,load:function(_1796,_1797){
var node=_1796.getElementsByTagName("TotalOps")[0];
var _1799=parseInt(dojo.isIE?node.xml.match(/.*>(\d*)<.*/)[1]:node.textContent);
var delta=_1799-_1794;
dojo.byId("global_ops").innerHTML=delta>0?delta:0;
_1794=_1799;
var _179b=0;
var _179c=_1796.getElementsByTagName("Reactor");
dojo.forEach(_179c,function(n){
var id=n.getAttribute("id");
var _179f=pion.reactors.reactors_by_id[id];
if(_179f){
if(_179f.workspace==pion.reactors.workspace_box){
var _17a0=n.getElementsByTagName("EventsIn")[0];
var _17a1=dojo.isIE?_17a0.xml.match(/.*>(\d*)<.*/)[1]:_17a0.textContent;
var _17a2=parseInt(_17a1);
_179f.ops_per_sec.innerHTML=_17a2-_179f.prev_events_in;
_179f.prev_events_in=_17a2;
_179b+=_17a2;
}
var _17a3=n.getElementsByTagName("Running")[0];
var _17a4=dojo.isIE?_17a3.xml.match(/.*>(\w*)<.*/)[1]:_17a3.textContent;
var _17a5=(_17a4=="true");
_179f.run_button.attr("checked",_17a5);
}
});
delta=_179b-_1795;
dojo.byId("workspace_ops").innerHTML=delta>0?delta:0;
_1795=_179b;
return _1796;
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
reactor_config_store.fetch({query:{tagName:"Reactor"},onItem:function(item,_17a7){
console.debug("fetched Reactor with id = ",reactor_config_store.getValue(item,"@id"));
var _17a8={};
var _17a9=reactor_config_store.getAttributes(item);
for(var i=0;i<_17a9.length;++i){
if(_17a9[i]!="tagName"&&_17a9[i]!="childNodes"){
_17a8[_17a9[i]]=reactor_config_store.getValue(item,_17a9[i]).toString();
}
}
pion.reactors.createReactorInConfiguredWorkspace(_17a8);
},onComplete:function(items,_17ac){
console.debug("done fetching Reactors");
reactor_config_store.fetch({query:{tagName:"Connection"},onItem:function(item,_17ae){
var _17af=pion.reactors.reactors_by_id[reactor_config_store.getValue(item,"From")];
var _17b0=pion.reactors.reactors_by_id[reactor_config_store.getValue(item,"To")];
pion.reactors.workspace_box=_17af.workspace;
surface=pion.reactors.workspace_box.my_surface;
dijit.byId("mainTabContainer").selectChild(pion.reactors.workspace_box.my_content_pane);
var _17b1=reactor_config_store.getValue(item,"@id").toString();
pion.reactors.createConnection(_17af,_17b0,_17b1);
},onComplete:function(items,_17b3){
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
pion.reactors.createReactorInConfiguredWorkspace=function(_17b4){
pion.reactors.workspace_box=workspaces_by_name[_17b4.Workspace];
if(!pion.reactors.workspace_box){
addWorkspace(_17b4.Workspace);
}
var _17b5=pion.reactors.workspace_box;
dijit.byId("mainTabContainer").selectChild(_17b5.my_content_pane);
var _17b6=document.createElement("div");
_17b5.node.appendChild(_17b6);
var _17b7=pion.reactors.createReactor(_17b4,_17b6);
pion.reactors.reactors_by_id[_17b4["@id"]]=_17b7;
_17b7.workspace=_17b5;
_17b5.reactors.push(_17b7);
console.debug("X, Y = ",_17b4.X,", ",_17b4.Y);
};
pion.reactors.createConnection=function(_17b8,_17b9,_17ba){
var line=surface.createPolyline().setStroke("black");
var _17bc=function(){
dojo.xhrDelete({url:"/config/connections/"+_17ba,handleAs:"xml",timeout:5000,load:function(_17bd,_17be){
for(var i1=0;i1<_17b8.reactor_outputs.length;++i1){
if(_17b8.reactor_outputs[i1].id==_17ba){
break;
}
}
for(var i2=0;i2<_17b9.reactor_inputs.length;++i2){
if(_17b9.reactor_inputs[i2].id==_17ba){
break;
}
}
var line=_17b8.reactor_outputs[i1].line;
pion.reactors.removeLine(line);
_17b8.reactor_outputs.splice(i1,1);
_17b9.reactor_inputs.splice(i2,1);
return _17bd;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
};
line.div1=document.createElement("div");
line.div1.style.position="absolute";
line.div1.onclick=function(){
pion.doDeleteConfirmationDialog("Delete this connection?",_17bc);
};
line.div1.onmouseover=function(){
line.div1.className="glowing_horiz";
line.div2.className="glowing_vert";
};
line.div1.onmouseout=function(){
line.div1.className="normal";
line.div2.className="normal";
};
pion.reactors.workspace_box.node.appendChild(line.div1);
line.div2=document.createElement("div");
line.div2.style.position="absolute";
line.div2.onclick=function(){
pion.doDeleteConfirmationDialog("Delete this connection?",_17bc);
};
line.div2.onmouseover=function(){
line.div1.className="glowing_horiz";
line.div2.className="glowing_vert";
};
line.div2.onmouseout=function(){
line.div1.className="normal";
line.div2.className="normal";
};
pion.reactors.workspace_box.node.appendChild(line.div2);
pion.reactors.updateConnectionLine(line,_17b8.domNode,_17b9.domNode);
_17b8.reactor_outputs.push({sink:_17b9,line:line,id:_17ba});
_17b9.reactor_inputs.push({source:_17b8,line:line,id:_17ba});
};
pion.reactors.removeLine=function(line){
pion.reactors.workspace_box.node.removeChild(line.div1);
pion.reactors.workspace_box.node.removeChild(line.div2);
line.removeShape();
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
var _17c7=new dijit.layout.ContentPane({"class":"workspacePane",title:title,style:"overflow: auto"});
var _17c8=dijit.byId("mainTabContainer");
var _17c9=dojo.marginBox(_17c8.domNode);
console.debug("margin_box = dojo.marginBox(tab_container.domNode) = ",_17c9);
var shim=document.createElement("div");
if(_17c9.w<minimum_workspace_width){
shim.style.width=minimum_workspace_width+"px";
}else{
shim.style.width=(_17c9.w-4)+"px";
}
if(_17c9.h<minimum_workspace_height){
shim.style.height=minimum_workspace_height+"px";
}
_17c7.domNode.appendChild(shim);
_17c8.addChild(_17c7,i);
var _17cb=new dojo.dnd.Target(shim,{accept:["reactor"]});
dojo.addClass(_17cb.node,"workspaceTarget");
dojo.connect(_17cb,"onDndDrop",function(_17cc,nodes,copy,_17cf){
pion.reactors.handleDropOnWorkspace(_17cc,nodes,copy,_17cb);
});
dojo.connect(_17cb.node,"onmouseup",updateLatestMouseUpEvent);
_17cb.my_content_pane=_17c7;
_17cb.onEmpty=function(_17d0){
};
_17c7.my_workspace_box=_17cb;
workspaces_by_name[title]=_17cb;
workspace_boxes[i]=_17cb;
_17c8.selectChild(_17c7);
_17cb.node.style.width=_17cb.node.offsetWidth+"px";
var _17d1=dojo.marginBox(_17cb.node);
_17d1.h-=6;
console.debug("surface_box = ",_17d1);
_17cb.my_surface=dojox.gfx.createSurface(_17cb.node,_17d1.w,_17d1.h);
_17cb.reactors=[];
_17cb.isTracking=false;
var menu=new dijit.Menu({targetNodeIds:[_17c7.controlButton.domNode,_17cb.node]});
menu.addChild(new dijit.MenuItem({label:"Edit workspace configuration",onClick:function(){
showWorkspaceConfigDialog(_17c7);
}}));
menu.addChild(new dijit.MenuItem({label:"Delete workspace",onClick:function(){
deleteWorkspaceIfConfirmed(_17c7);
}}));
_17cb.node.ondblclick=function(){
showWorkspaceConfigDialog(_17c7);
};
_17c7.controlButton.domNode.ondblclick=function(){
showWorkspaceConfigDialog(_17c7);
};
};
function makeScrollHandler(_17d3){
var _pane=_17d3;
var _node=_17d3.domNode;
return function(){
if(_pane.isScrolling){
return;
}
_pane.isScrolling=true;
var _17d6=function(){
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
setTimeout(_17d6,0);
};
};
function updateLatestMouseUpEvent(e){
latest_event=e;
console.debug("e = ",e);
pion.reactors.last_x=e.clientX;
pion.reactors.last_y=e.clientY;
};
pion.reactors.getNearbyGridPointInBox=function(_17d8,_17d9){
var c=_17d8;
c.l+=STEP-1;
c.l-=c.l%STEP;
c.t+=STEP-1;
c.t-=c.t%STEP;
var _17db={};
_17db.l=_17d9.l<c.l?c.l:c.r<_17d9.l?c.r:_17d9.l;
_17db.t=_17d9.t<c.t?c.t:c.b<_17d9.t?c.b:_17d9.t;
_17db.l-=_17db.l%STEP;
_17db.t-=_17db.t%STEP;
return _17db;
};
pion.reactors.updateConnectionLine=function(poly,_17dd,_17de){
var x1=_17dd.offsetLeft+_17dd.offsetWidth/2;
var y1=_17dd.offsetTop+_17dd.offsetHeight/2;
if(_17de.offsetTop>y1){
var x2=_17de.offsetLeft+_17de.offsetWidth/2;
var y2=_17de.offsetTop;
var a1={x:x2-5,y:y2-5};
var a2={x:x2+5,y:y2-5};
}else{
if(_17de.offsetTop+_17de.offsetHeight<y1){
var x2=_17de.offsetLeft+_17de.offsetWidth/2;
var y2=_17de.offsetTop+_17de.offsetHeight;
var a1={x:x2-5,y:y2+5};
var a2={x:x2+5,y:y2+5};
}else{
if(_17de.offsetLeft>x1){
var x2=_17de.offsetLeft;
var y2=y1;
var a1={x:x2-5,y:y2-5};
var a2={x:x2-5,y:y2+5};
}else{
var x2=_17de.offsetLeft+_17de.offsetWidth;
var y2=y1;
var a1={x:x2+5,y:y2-5};
var a2={x:x2+5,y:y2+5};
}
}
}
poly.setShape([{x:x1,y:y1},{x:x2,y:y1},{x:x2,y:y2},a1,{x:x2,y:y2},a2]).setStroke("black");
var _17e5=6;
poly.div1.style.top=(y1-_17e5)+"px";
poly.div1.style.height=(2*_17e5)+"px";
if(x1<x2){
poly.div1.style.left=x1+"px";
poly.div1.style.width=(x2-x1)+"px";
}else{
poly.div1.style.left=x2+"px";
poly.div1.style.width=(x1-x2)+"px";
}
poly.div2.style.left=(x2-_17e5)+"px";
poly.div2.style.width=(2*_17e5)+"px";
if(y1<y2){
poly.div2.style.top=y1+"px";
poly.div2.style.height=(y2-y1)+"px";
}else{
poly.div2.style.top=y2+"px";
poly.div2.style.height=(y1-y2)+"px";
}
};
pion.reactors.createReactor=function(_17e6,node){
plugin_class_name="plugins.reactors."+_17e6.Plugin;
var _17e8=dojo.getObject(plugin_class_name);
if(_17e8){
console.debug("found class ",plugin_class_name);
var _17e9=new _17e8({config:_17e6},node);
}else{
console.debug("class ",plugin_class_name," not found; using plugins.reactors.Reactor instead.");
var _17e9=new plugins.reactors.Reactor({config:_17e6},node);
}
return _17e9;
};
pion.reactors.handleDropOnWorkspace=function(_17ea,nodes,copy,_17ed){
console.debug("handleDropOnWorkspace called, target.node = ",_17ed.node,", workspace_box.node = ",pion.reactors.workspace_box.node);
dojo.query(".dojoDndItem",pion.reactors.workspace_box.node).forEach(function(n){
if(n.getAttribute("dndType")=="connector"){
console.debug("Removing ",n);
pion.reactors.workspace_box.node.removeChild(n);
}
});
if(!_17ed.checkAcceptance(_17ea,nodes)){
return;
}
if(_17ed!=pion.reactors.workspace_box){
return;
}
var _17ef=nodes[0].getAttribute("reactor_type");
pion.reactors.showReactorInitDialog(_17ef);
};
pion.reactors.showReactorInitDialog=function(_17f0){
if(pion.key_service_running&&plugins.reactors[_17f0].edition=="Enterprise"){
pion.about.checkKeyStatus({success_callback:function(){
pion.reactors._showReactorInitDialog(_17f0);
}});
}else{
pion.reactors._showReactorInitDialog(_17f0);
}
};
pion.reactors._showReactorInitDialog=function(_17f1){
var _17f2="plugins.reactors."+_17f1+"InitDialog";
console.debug("dialog_class_name: ",_17f2);
var _17f3=dojo.getObject(_17f2);
if(_17f3){
var _17f4=new _17f3();
if(plugins.reactors[_17f1].option_defaults){
var _17f5=[];
for(var _17f6 in plugins.reactors[_17f1].option_defaults){
if(plugins.reactors[_17f1].option_defaults[_17f6]){
_17f5.push(_17f6);
}
}
_17f4.attr("value",{options:_17f5});
}
}else{
var _17f4=new plugins.reactors.ReactorInitDialog({title:plugins.reactors[_17f1].label+" Initialization",plugin:_17f1});
}
setTimeout(function(){
dojo.query("input",_17f4.domNode)[0].select();
},500);
dojo.query(".dijitButton.cancel",_17f4.domNode).forEach(function(n){
dojo.connect(n,"click",_17f4,"onCancel");
});
_17f4.show();
};
pion.reactors.handleDropOnReactor=function(_17f8,nodes,copy,_17fb){
var _17fc=pion.reactors.workspace_box;
console.debug("handleDropOnReactor called, target.node.getAttribute(\"reactor_type\") = ",_17fb.node.getAttribute("reactor_type"));
if(!_17fb.node.getAttribute("reactor_type")){
return;
}
dojo.query(".dojoDndItem",_17fb.node).forEach(function(n){
_17fb.node.removeChild(n);
});
if(_17fc.isTracking){
return;
}
console.debug("nodes[0].getAttribute(\"dndType\") = ",nodes[0].getAttribute("dndType"));
console.debug("nodes[0].getAttribute(\"reactor_type\") = ",nodes[0].getAttribute("reactor_type"));
if(nodes[0].getAttribute("dndType")!="connector"){
console.debug("returning because nodes[0].getAttribute(\"dndType\") != \"connector\"");
return;
}
_17fc.isTracking=true;
var x1=_17fb.node.offsetLeft+_17fb.node.offsetWidth;
var y1=_17fb.node.offsetTop+_17fb.node.offsetHeight/2;
console.debug("x1 = ",x1,", y1 = ",y1);
_17fc.trackLine=surface.createPolyline([{x:x1,y:y1},{x:x1+20,y:y1},{x:x1+15,y:y1-5},{x:x1+20,y:y1},{x:x1+15,y:y1+5}]).setStroke("black");
var _1800=dojo.byId("reactor_config_content").offsetLeft;
var _1801=dojo.byId("reactor_config_content").offsetTop;
_1801+=dojo.byId("main_stack_container").offsetTop;
console.debug("xOffset = ",_1800,", yOffset = ",_1801);
mouseConnection=dojo.connect(_17fc.node,"onmousemove",function(event){
var x2=event.clientX-_1800;
var y2=event.clientY-_1801;
_17fc.trackLine.setShape([{x:x1,y:y1},{x:x2,y:y1},{x:x2,y:y2}]);
});
console.debug("created mouseConnection");
wrapperWithStartpoint=function(event){
dojo.disconnect(mouseConnection);
console.debug("disconnected mouseConnection");
_17fc.trackLine.removeShape();
handleSelectionOfConnectorEndpoint(event,_17fb.node);
};
dojo.query(".moveable").filter(function(n){
return n!=_17fb.node;
}).forEach("item.onClickHandler = dojo.connect(item, 'click', wrapperWithStartpoint)");
};
function handleSelectionOfConnectorEndpoint(event,_1808){
pion.reactors.workspace_box.isTracking=false;
console.debug("handleSelectionOfConnectorEndpoint: event = ",event);
var _1809=dijit.byNode(_1808);
console.debug("source_reactor = ",_1809);
var _180a=dijit.byNode(event.target);
if(!_180a){
_180a=dijit.byNode(event.target.parentNode);
}
console.debug("sink_reactor = ",_180a);
dojo.query(".moveable").forEach("dojo.disconnect(item.onClickHandler)");
var _180b="<PionConfig><Connection><Type>reactor</Type>"+"<From>"+_1809.config["@id"]+"</From>"+"<To>"+_180a.config["@id"]+"</To>"+"</Connection></PionConfig>";
dojo.rawXhrPost({url:"/config/connections",contentType:"text/xml",handleAs:"xml",postData:_180b,load:function(_180c){
var node=_180c.getElementsByTagName("Connection")[0];
var id=node.getAttribute("id");
console.debug("connection id (from server): ",id);
pion.reactors.createConnection(_1809,_180a,id);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_180b})});
};
pion.reactors.showReactorConfigDialog=function(_180f){
if(pion.key_service_running&&plugins.reactors[_180f.config.Plugin].edition=="Enterprise"){
pion.about.checkKeyStatus({success_callback:function(){
pion.reactors._showReactorConfigDialog(_180f);
}});
}else{
pion.reactors._showReactorConfigDialog(_180f);
}
};
pion.reactors._showReactorConfigDialog=function(_1810){
var _1811="plugins.reactors."+_1810.config.Plugin+"Dialog";
console.debug("dialog_class_name = ",_1811);
var _1812=dojo.getObject(_1811);
if(_1812){
var _1813=new _1812({reactor:_1810});
}else{
var _1813=new plugins.reactors.ReactorDialog({title:_1810.config.Plugin+" Configuration",reactor:_1810});
}
_1813.attr("value",_1810.config);
var _1814=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:[]}});
dojo.forEach(_1810.reactor_inputs,function(_1815){
_1814.newItem({ID:_1815.id,Source:_1815.source.config.Name,DeleteButton:"yes"});
});
pion.reactors.connection_store.fetch({query:{"To":_1810.config["@id"],"Type":"input"},onItem:function(item){
var _1817=pion.reactors.connection_store.getValue(item,"From");
var _1818=pion.reactors.connection_store.getValue(item,"@id");
_1814.newItem({ID:_1818,Source:_1817});
},onError:pion.handleFetchError});
var _1819=function(v){
if(v=="yes"){
return "<button dojoType=dijit.form.Button class=\"delete_row\"></button>";
}else{
return "";
}
};
var _181b=[{rows:[{field:"Source",name:"From",styles:"",width:"auto"},{field:"ID",name:"Connection ID",styles:"",width:"auto"},{field:"DeleteButton",name:"Delete",styles:"align: center;",width:3,formatter:_1819}]}];
var _181c=new dojox.grid.DataGrid({store:_1814,structure:_181b,singleClickEdit:true,autoHeight:true},document.createElement("div"));
_1813.reactor_inputs_grid_node.appendChild(_181c.domNode);
_181c.startup();
_181c.connect(_181c,"onCellClick",function(e){
if(e.cell.name=="Delete"){
var item=this.getItem(e.rowIndex);
if(this.store.hasAttribute(item,"DeleteButton")){
this.store.deleteItem(item);
var _181f=_1810.reactor_inputs[e.rowIndex];
dojo.xhrDelete({url:"/config/connections/"+_181f.id,handleAs:"xml",timeout:5000,load:function(_1820,_1821){
var _1822=_181f.source;
pion.reactors.removeLine(_181f.line);
_1810.reactor_inputs.splice(e.rowIndex,1);
for(var j=0;j<_1822.reactor_outputs.length;++j){
if(_1822.reactor_outputs[j].sink==_1810){
_1822.reactor_outputs.splice(j,1);
break;
}
}
return _1820;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
}
}
});
var _1824=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:[]}});
dojo.forEach(_1810.reactor_outputs,function(_1825){
_1824.newItem({ID:_1825.id,Sink:_1825.sink.config.Name,DeleteButton:"yes"});
});
pion.reactors.connection_store.fetch({query:{"From":_1810.config["@id"],"Type":"output"},onItem:function(item){
var sink=pion.reactors.connection_store.getValue(item,"To");
var _1828=pion.reactors.connection_store.getValue(item,"@id");
_1824.newItem({ID:_1828,Sink:sink});
},onError:pion.handleFetchError});
var _1829=[{rows:[{field:"Sink",name:"To",styles:"",width:"auto"},{field:"ID",name:"Connection ID",styles:"",width:"auto"},{field:"DeleteButton",name:"Delete",styles:"align: center;",width:3,formatter:_1819}]}];
var _182a=new dojox.grid.DataGrid({store:_1824,structure:_1829,singleClickEdit:true,autoHeight:true},document.createElement("div"));
_1813.reactor_outputs_grid_node.appendChild(_182a.domNode);
_182a.startup();
_182a.connect(_182a,"onCellClick",function(e){
if(e.cell.name=="Delete"){
var item=this.getItem(e.rowIndex);
if(this.store.hasAttribute(item,"DeleteButton")){
this.store.deleteItem(item);
var _182d=_1810.reactor_outputs[e.rowIndex];
dojo.xhrDelete({url:"/config/connections/"+_182d.id,handleAs:"xml",timeout:5000,load:function(_182e,_182f){
var _1830=_182d.sink;
pion.reactors.removeLine(_182d.line);
_1810.reactor_outputs.splice(e.rowIndex,1);
for(var j=0;j<_1830.reactor_inputs.length;++j){
if(_1830.reactor_inputs[j].source==_1810){
_1830.reactor_inputs.splice(j,1);
break;
}
}
return _182e;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
}
}
});
dojo.query(".dijitButton.delete",_1813.domNode).forEach(function(n){
dojo.connect(n,"click",function(){
_1813.onCancel();
pion.reactors.deleteReactorIfConfirmed(_1810);
});
});
dojo.query(".dijitButton.cancel",_1813.domNode).forEach(function(n){
dojo.connect(n,"click",_1813,"onCancel");
});
dojo.query(".dijitButton.save",_1813.domNode).forEach(function(n){
dijit.byNode(n).onClick=function(){
return _1813.isValid();
};
});
setTimeout(function(){
dojo.query("input",_1813.domNode)[0].select();
},500);
setTimeout(function(){
_1813.show();
},1000);
};
pion.reactors.showXMLDialog=function(_1835){
window.open("/config/reactors/"+_1835.config["@id"]);
};
pion.reactors.deleteReactorIfConfirmed=function(_1836){
pion.doDeleteConfirmationDialog("Are you sure you want to delete this reactor?",deleteReactor,_1836);
};
function deleteReactor(_1837){
console.debug("deleting ",_1837.config.Name);
dojo.xhrDelete({url:"/config/reactors/"+_1837.config["@id"],handleAs:"xml",timeout:5000,load:function(_1838,_1839){
console.debug("xhrDelete for url = /config/reactors/",_1837.config["@id"],"; HTTP status code: ",_1839.xhr.status);
for(var i=0;i<_1837.reactor_inputs.length;++i){
var _183b=_1837.reactor_inputs[i].source;
pion.reactors.removeLine(_1837.reactor_inputs[i].line);
for(var j=0;j<_183b.reactor_outputs.length;++j){
if(_183b.reactor_outputs[j].sink==_1837){
_183b.reactor_outputs.splice(j,1);
}
}
}
for(var i=0;i<_1837.reactor_outputs.length;++i){
var _183d=_1837.reactor_outputs[i].sink;
pion.reactors.removeLine(_1837.reactor_outputs[i].line);
for(var j=0;j<_183d.reactor_inputs.length;++j){
if(_183d.reactor_inputs[j].source==_1837){
_183d.reactor_inputs.splice(j,1);
}
}
}
var _183e=pion.reactors.workspace_box;
_183e.node.removeChild(_1837.domNode);
for(var j=0;j<_183e.reactors.length;++j){
if(_183e.reactors[j]==_1837){
_183e.reactors.splice(j,1);
}
}
if(_183e.reactors.length==0){
_183e.onEmpty(_183e.my_content_pane);
}
return _1838;
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
var _1840=pion.reactors.workspace_box;
var _1841=_1840.my_content_pane.domNode.offsetWidth;
var _1842=_1840.my_content_pane.domNode.offsetHeight;
_1841-=2;
_1842-=6;
var _1843=surface.getDimensions();
var _1844=parseInt(_1843.width);
var _1845=parseInt(_1843.height);
console.debug("old_width = ",_1844,", new_width = ",_1841,", old_height = ",_1845,", new_height = ",_1842);
if(_1841>_1844){
console.debug("expanding workspace width to ",_1841,"px");
_1840.node.style.width=_1841+"px";
_1843.width=_1841;
}
if(_1842>_1845){
console.debug("expanding workspace height to ",_1842,"px");
_1840.node.style.height=_1842+"px";
_1843.height=_1842;
}
if(_1841>_1844||_1842>_1845){
surface.setDimensions(parseInt(_1843.width)+"px",parseInt(_1843.height)+"px");
}
};
function handleKeyPress(e){
var _1847=pion.reactors.workspace_box;
if(e.keyCode==dojo.keys.ESCAPE){
if(_1847.isTracking){
dojo.disconnect(mouseConnection);
_1847.trackLine.removeShape();
_1847.isTracking=false;
}
}
};
function showWorkspaceConfigDialog(_1848){
var _1849=pion.reactors.workspace_dialog;
if(!_1849){
_1849=new pion.reactors.WorkspaceDialog({title:"Workspace Configuration"});
_1849.workspace_name.isValid=function(_184a){
if(!this.validator(this.textbox.value,this.constraints)){
this.invalidMessage="Invalid Workspace name";
console.debug("validationTextBox.isValid returned false");
return false;
}
if(isDuplicateWorkspaceName(_1848,this.textbox.value)){
this.invalidMessage="A Workspace with this name already exists";
console.debug("In validationTextBox.isValid, isDuplicateWorkspaceName returned true");
return false;
}
console.debug("validationTextBox.isValid returned true");
return true;
};
_1849.save_button.onClick=function(){
return _1849.isValid();
};
pion.reactors.workspace_dialog=_1849;
}
_1849.attr("value",{name:_1848.title,comment:_1848.comment});
_1849.workspace_pane=_1848;
setTimeout(function(){
dojo.query("input",_1849.domNode)[0].select();
},500);
_1849.show();
_1849.execute_already_called=false;
_1849.execute=function(_184b){
if(this.execute_already_called){
console.debug("See http://trac.atomiclabs.com/ticket/685.");
return;
}
this.execute_already_called=true;
updateWorkspaceConfig(_184b,_1848);
};
};
function updateWorkspaceConfig(_184c,_184d){
var _184e=_184c.name;
if(_184e!=_184d.title){
_184d.title=_184e;
dojo.byId(_184d.controlButton.id).innerHTML=_184e;
dojo.forEach(_184d.my_workspace_box.reactors,function(_184f){
_184f.changeWorkspace(_184e);
});
}
_184d.comment=_184c.comment;
};
function isDuplicateWorkspaceName(_1850,name){
for(var i=0;i<workspace_boxes.length;++i){
if(workspace_boxes[i].my_content_pane!=_1850&&workspace_boxes[i].my_content_pane.title==name){
return true;
}
}
return false;
};
function deleteWorkspaceIfConfirmed(_1853){
if(_1853.my_workspace_box.reactors.length==0){
_deleteEmptyWorkspace(_1853);
return;
}
pion.doDeleteConfirmationDialog("Are you sure you want to delete workspace '"+_1853.title+"' and all the reactors it contains?",deleteWorkspace,_1853);
};
function deleteWorkspace(_1854){
var _1855=[];
for(var i=0;i<_1854.my_workspace_box.reactors.length;++i){
_1855[i]=_1854.my_workspace_box.reactors[i];
}
for(i=0;i<_1855.length;++i){
deleteReactor(_1855[i]);
}
dojo.connect(_1854.my_workspace_box,"onEmpty",_deleteEmptyWorkspace);
};
function _deleteEmptyWorkspace(_1857){
console.debug("deleting ",_1857.title);
delete workspaces_by_name[_1857.title];
for(var j=0;j<workspace_boxes.length;++j){
if(workspace_boxes[j]==_1857.my_workspace_box){
workspace_boxes.splice(j,1);
}
}
dijit.byId("mainTabContainer").removeChild(_1857);
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
dojo.declare("plugins.vocabularies.Vocabulary",[],{constructor:function(_1859,args){
this.config=_1859;
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
this.server_vocab_store.fetch({query:{"tagName":"Vocabulary"},onComplete:function(items,_185e){
console.debug("server_vocab_store.fetch.onComplete: items.length = ",items.length);
_this.vocab_item=items[0];
_this.populateFromServerVocabItem();
},onError:pion.handleFetchError});
},populateFromServerVocabItem:function(){
var name=this.server_vocab_store.getValue(this.vocab_item,"Name");
if(name){
this.config.Name=name.toString();
}
var _1860=this.server_vocab_store.getValue(this.vocab_item,"Comment");
if(_1860){
this.config.Comment=_1860.toString();
}
var _1861=this.server_vocab_store.getValue(this.vocab_item,"Locked");
this.config.Locked=(typeof _1861!=="undefined")&&_1861.toString()=="true";
console.dir(this.config);
var store=this.server_vocab_term_store;
var items=[];
var _this=this;
store.fetch({onItem:function(item){
var _1866={full_id:store.getValue(item,"@id"),ID:store.getValue(item,"@id").split("#")[1]};
var type=store.getValue(item,"Type");
_1866.Type=pion.terms.type_descriptions_by_name[type.toString()];
_1866.Format=store.getValue(type,"@format");
_1866.Size=store.getValue(type,"@size");
var _1868=store.getValue(item,"Comment");
if(_1868){
_1866.Comment=_1868.toString();
}
items.push(_1866);
},onComplete:function(){
_this.vocab_term_store=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:items}});
_this.vocab_term_store._saveCustom=_this._getSaveCustomFunction();
_this.onDoneLoadingTerms();
},onError:pion.handleFetchError});
},onDoneLoadingTerms:function(){
},_getSaveCustomFunction:function(){
var _this=this;
return function(_186a,_186b){
var store=this;
var _186d=0,_186e=0;
var ID,url;
for(ID in this._pending._modifiedItems){
if(this._pending._newItems[ID]||this._pending._deletedItems[ID]){
continue;
}
url=dojox.dtl.filter.strings.urlencode("/config/terms/"+_this.config["@id"]+"#"+ID);
console.debug("_saveCustom: url = ",url);
this.fetchItemByIdentity({identity:ID,onItem:function(item){
var _1872="<PionConfig><Term><Type";
var _1873=store.getValue(item,"Format");
if(_1873&&_1873!="-"){
_1872+=" format=\""+pion.escapeXml(_1873)+"\"";
}
var size=store.getValue(item,"Size");
if(size&&size!="-"){
_1872+=" size=\""+pion.escapeXml(size)+"\"";
}
_1872+=">"+pion.terms.types_by_description[store.getValue(item,"Type")]+"</Type>";
if(store.getValue(item,"Comment")){
_1872+=pion.makeXmlLeafElement("Comment",store.getValue(item,"Comment"));
}
_1872+="</Term></PionConfig>";
console.debug("put_data = ",_1872);
_186d++;
dojo.rawXhrPut({url:url,handleAs:"xml",timeout:5000,contentType:"text/xml",putData:_1872,load:function(_1875,_1876){
console.debug("rawXhrPut for url = "+this.url,"; HTTP status code: ",_1876.xhr.status);
if(++_186e==_186d){
_this.onSaveComplete();
}
return _1875;
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_1872})});
},onError:pion.handleFetchError});
}
for(ID in this._pending._newItems){
url=dojox.dtl.filter.strings.urlencode("/config/terms/"+_this.config["@id"]+"#"+ID);
console.debug("_saveCustom: url = ",url);
var item=this._pending._newItems[ID];
var _1878="<PionConfig><Term><Type";
var _1879=store.getValue(item,"Format");
if(_1879&&_1879!="-"){
_1878+=" format=\""+pion.escapeXml(_1879)+"\"";
}
var size=store.getValue(item,"Size");
if(size&&size!="-"){
_1878+=" size=\""+pion.escapeXml(size)+"\"";
}
_1878+=">"+pion.terms.types_by_description[store.getValue(item,"Type")]+"</Type>";
if(store.getValue(item,"Comment")){
_1878+=pion.makeXmlLeafElement("Comment",store.getValue(item,"Comment"));
}
_1878+="</Term></PionConfig>";
console.debug("post_data = ",_1878);
_186d++;
dojo.rawXhrPost({url:url,handleAs:"xml",timeout:5000,contentType:"text/xml",postData:_1878,load:function(_187b,_187c){
console.debug("rawXhrPost for url = "+this.url,"; HTTP status code: ",_187c.xhr.status);
if(++_186e==_186d){
_this.onSaveComplete();
}
return _187b;
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1878})});
}
for(ID in this._pending._deletedItems){
url=dojox.dtl.filter.strings.urlencode("/config/terms/"+_this.config["@id"]+"#"+ID);
console.debug("_saveCustom: url = ",url);
_186d++;
dojo.xhrDelete({url:url,handleAs:"xml",timeout:5000,load:function(_187d,_187e){
console.debug("xhrDelete for url = "+this.url,"; HTTP status code: ",_187e.xhr.status);
if(++_186e==_186d){
_this.onSaveComplete();
}
return _187d;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
}
_186a();
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
},execute:function(_1881){
if(this.execute_already_called){
console.debug("See http://trac.atomiclabs.com/ticket/685.");
return;
}
this.execute_already_called=true;
var _1882={ID:_1881["@id"],Type:_1881.Type,Comment:_1881.Comment};
_1882.Format=_1881.Format?_1881.Format:"-";
_1882.Size=_1881.Size?_1881.Size:"-";
this.vocabulary.vocab_term_store.newItem(_1882);
if(this.pane){
this.pane.markAsChanged();
}else{
this.vocabulary.saveChangedTerms();
if(this.onNewTermSaved){
this.onNewTermSaved(this.vocabulary.config["@id"]+"#"+_1882.ID);
}
}
}});
dojo.declare("plugins.vocabularies.VocabularyPane",[dijit.layout.ContentPane,dijit._Templated],{templateString:"<div class='vocab_pane' dojoAttachPoint='containerNode'\r\n\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t><br/\r\n\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t><td rowspan=\"4\" valign=\"top\"><textarea dojoAttachPoint=\"comment\" rows=\"4\" name=\"Comment\" class=\"comment\"></textarea></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t><td rowspan=\"3\">&nbsp;</td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Locked</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"checkboxes\" value=\"locked\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t\t><br/\r\n\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"border: 1px solid #999999;\" width=\"99%\"\r\n\t\t\t><tr\r\n\t\t\t\t><td class=\"matrixMainHeader\">Terms</td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td style=\"background-color: #f1f1f1;\"\r\n\t\t\t\t\t><div class=\"vocab_grid plugin_pane_grid\" dojoAttachPoint=\"vocab_term_grid_node\"></div\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"add_new_row\" dojoAttachPoint=\"add_new_term_button\" dojoAttachEvent=\"onClick:_handleAddNewTerm\">ADD NEW TERM</button\r\n\t\t\t\t></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick:save\">Save Changes</button\r\n\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick:cancel\">Cancel Changes</button\r\n\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick:delete2\">Delete Vocabulary</button\r\n\t\t></div\r\n\t></form\r\n></div>\r\n",postMixInProperties:function(){
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
},getHeight:function(){
return 450;
},initGrid:function(){
var _this=this;
this.vocab_grid_layout=[{defaultCell:{editable:true,type:dojox.grid.cells._Widget,styles:"text-align: left;"},rows:[{field:"ID",name:"ID",width:15,editable:false},{field:"Type",name:"Type",width:15,widgetClass:pion.widgets.SimpleSelect,widgetProps:{store:pion.terms.type_store,searchAttr:"description"}},{field:"Format",name:"Format",width:10},{field:"Size",name:"Size",width:3},{field:"Comment",name:"Comment",width:"auto",formatter:pion.xmlCellFormatter},{name:"Delete",styles:"align: center;",width:3,editable:false,formatter:pion.makeDeleteButton}]}];
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
this.vocab_term_grid.canEdit=function(cell,_1889){
if(_this.vocabulary.config.Locked){
return false;
}else{
switch(cell.field){
case "Format":
var item=this.getItem(_1889);
var type=this.store.getValue(item,"Type").toString();
return (type=="specific date"||type=="specific time"||type=="specific time & date");
case "Size":
var item=this.getItem(_1889);
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
var _188e=_this.vocab_term_grid.layout.cellCount-1;
_this.vocab_term_grid.layout.setColumnVisibility(_188e,!_this.vocabulary.config.Locked);
var _188f=dojo.clone(_this.vocabulary.config);
_188f.checkboxes=_this.vocabulary.config.Locked?["locked"]:[];
_this.form.attr("value",_188f);
var _1890=dojo.query("textarea.comment",_this.form.domNode)[0];
_1890.value=_this.vocabulary.config.Comment?_this.vocabulary.config.Comment:"";
_this.vocab_term_grid.setStore(_this.vocabulary.vocab_term_store);
var node=_this.domNode;
setTimeout(function(){
dojo.removeClass(node,"unsaved_changes");
},500);
});
this.vocabulary.populateFromServerVocabStore();
},_handleAddNewTerm:function(){
console.debug("_handleAddNewTerm");
var _1892=new plugins.vocabularies.TermInitDialog({vocabulary:this.vocabulary,pane:pion.vocabularies.selected_pane});
_1892.save_button.onClick=function(){
return _1892.isValid();
};
setTimeout(function(){
dojo.query("input",_1892.domNode)[0].select();
},500);
_1892.show();
},save:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.saveVocabConfig();
this.vocabulary.saveChangedTerms();
},saveVocabConfig:function(){
var _this=this;
var _1894=this.form.attr("value");
this.vocabulary.config.Name=_1894.Name;
this.vocabulary.config.Locked=dojo.indexOf(_1894.checkboxes,"locked")>=0;
var _1895=dojo.query("textarea.comment",this.form.domNode)[0];
this.vocabulary.config.Comment=_1895.value;
var _1896="<PionConfig><Vocabulary>";
for(var tag in this.vocabulary.config){
if(tag!="@id"){
_1896+=pion.makeXmlLeafElement(tag,this.vocabulary.config[tag]);
}
}
_1896+="</Vocabulary></PionConfig>";
console.debug("put_data: ",_1896);
_this=this;
dojo.rawXhrPut({url:"/config/vocabularies/"+this.vocabulary.config["@id"],contentType:"text/xml",handleAs:"xml",putData:_1896,load:function(_1898){
console.debug("response: ",_1898);
_this.populateFromServerVocabStore();
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_1896})});
},cancel:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.vocabulary.vocab_term_store.revert();
this.populateFromServerVocabStore();
},delete2:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
console.debug("delete2: selected vocabulary is ",this.title);
_this=this;
dojo.xhrDelete({url:"/config/vocabularies/"+this.vocabulary.config["@id"],handleAs:"xml",timeout:5000,load:function(_1899,_189a){
console.debug("xhrDelete for url = "+this.url,"; HTTP status code: ",_189a.xhr.status);
dijit.byId("vocab_config_accordion").forward();
dijit.byId("vocab_config_accordion").removeChild(_this);
pion.vocabularies._adjustAccordionSize();
return _1899;
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
var _189b=dijit.byId("vocab_config_accordion");
var _189c=pion.vocabularies.selected_pane.getHeight();
dojo.forEach(_189b.getChildren(),function(pane){
_189c+=pane._buttonWidget.getTitleHeight();
});
_189b.resize({h:_189c});
pion.vocabularies.height=_189c+160;
dijit.byId("main_stack_container").resize({h:pion.vocabularies.height});
};
pion.vocabularies.isDuplicateVocabularyId=function(id){
var _189f="urn:vocab:"+id;
return (_189f in pion.vocabularies.vocabularies_by_id);
};
pion.vocabularies.isDuplicateVocabularyName=function(name){
if(dijit.byId("vocab_config_accordion")){
var _18a1=dijit.byId("vocab_config_accordion").getChildren();
for(var i=0;i<_18a1.length;++i){
if(_18a1[i].title==name){
return true;
}
}
}
return false;
};
pion.vocabularies.addNewVocabulary=function(){
var _18a3=new plugins.vocabularies.VocabularyInitDialog();
dojo.query(".dijitButton.save",_18a3.domNode).forEach(function(n){
dijit.byNode(n).onClick=function(){
return _18a3.isValid();
};
});
setTimeout(function(){
dojo.query("input",_18a3.domNode)[0].select();
},500);
_18a3.show();
_18a3.execute=function(_18a5){
if(this.execute_already_called){
console.debug("See http://trac.atomiclabs.com/ticket/685.");
return;
}
this.execute_already_called=true;
var _18a6="<PionConfig><Vocabulary>";
_18a6+=pion.makeXmlLeafElement("Name",_18a5.Name);
_18a6+=pion.makeXmlLeafElement("Comment",_18a5.Comment);
_18a6+="</Vocabulary></PionConfig>";
console.debug("post_data: ",_18a6);
var _18a7="urn:vocab:"+_18a5["@id"];
dojo.rawXhrPost({url:"/config/vocabularies/"+_18a7,contentType:"text/xml",handleAs:"xml",postData:_18a6,load:function(_18a8){
if(vocab_config_page_initialized){
pion.vocabularies.createNewPaneFromStore(_18a7,pion.current_page=="Vocabularies");
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_18a6})});
};
};
pion.vocabularies.config_store=new dojox.data.XmlStore({url:"/config/vocabularies",rootItem:"VocabularyConfig",attributeMap:{"VocabularyConfig.id":"@id"}});
pion.vocabularies.init=function(){
pion.vocabularies.selected_pane=null;
pion.vocabularies.config_accordion=dijit.byId("vocab_config_accordion");
pion.vocabularies.config_accordion.title_attribute="@id";
pion.vocabularies.config_accordion.createNewPaneFromItem=function(item,store){
var id=pion.vocabularies.config_store.getValue(item,"@id");
var title=pion.escapeXml(store.getValue(item,this.title_attribute));
var _18ad=document.createElement("span");
var _18ae=new plugins.vocabularies.VocabularyPane({"class":"vocab_pane",title:title,config:{"@id":id}},_18ad);
this.addChild(_18ae);
return _18ae;
};
var _18af=null;
var _18b0=["@id","Type","@format","Size","Comment"];
var _18b1=_18b0.length;
pion.vocabularies._replaceAccordionPane=function(_18b2){
var _18b3=new plugins.vocabularies.VocabularyPane({title:_18b2.title,config:_18b2.config});
_18b3.initialized=true;
var _18b4=dijit.byId("vocab_config_accordion");
var idx=_18b4.getIndexOfChild(_18b2);
_18b4.pendingSelection=_18b3;
_18b4.pendingRemoval=_18b2;
_18b4.addChild(_18b3,idx);
};
pion.vocabularies._updatePane=function(pane){
pane.populateFromServerVocabStore();
pion.vocabularies._adjustAccordionSize();
dojo.style(pane.containerNode,"overflow","hidden");
};
function _18b7(pane){
console.debug("Selected "+pane.title);
var _18b9=pion.vocabularies.selected_pane;
if(pane==_18b9){
return;
}
var _18ba=dijit.byId("vocab_config_accordion");
if(_18b9&&dojo.hasClass(_18b9.domNode,"unsaved_changes")){
var _18bb=new dijit.Dialog({title:"Warning: unsaved changes"});
_18bb.attr("content","Please save or cancel unsaved changes before selecting another Vocabulary.");
_18bb.show();
setTimeout(function(){
_18ba.selectChild(_18b9);
},500);
return;
}
setTimeout(function(){
if(_18ba.pendingRemoval){
_18ba.removeChild(_18ba.pendingRemoval);
_18ba.pendingRemoval=false;
}
if(!pane.initialized){
pion.vocabularies._replaceAccordionPane(pane);
}else{
pion.vocabularies.selected_pane=pane;
pion.vocabularies._updatePane(pane);
}
},_18ba.duration+100);
};
function _18bc(pane){
var _18be=dijit.byId("vocab_config_accordion");
setTimeout(function(){
if(_18be.pendingSelection){
_18be.selectChild(_18be.pendingSelection);
_18be.pendingSelection=false;
}
},_18be.duration);
};
function _18bf(pane){
};
dojo.subscribe("vocab_config_accordion-selectChild",_18b7);
dojo.subscribe("vocab_config_accordion-addChild",_18bc);
dojo.subscribe("vocab_config_accordion-removeChild",_18bf);
pion.vocabularies.createNewPaneFromStore=function(id,_18c2){
pion.vocabularies.config_store.fetch({query:{"@id":id},onItem:function(item){
var _18c4=pion.vocabularies.config_accordion.createNewPaneFromItem(item,pion.vocabularies.config_store);
if(_18c2){
pion.vocabularies._adjustAccordionSize();
dijit.byId("vocab_config_accordion").selectChild(_18c4);
}
},onError:pion.handleFetchError});
};
pion.vocabularies.config_store.fetch({onComplete:function(items,_18c6){
pion.vocabularies.config_accordion.createPanesFromAllItems(items,pion.vocabularies.config_store);
pion.vocabularies.vocabularies_by_id={};
dojo.forEach(pion.vocabularies.config_accordion.getChildren(),function(pane){
var id=pane.vocabulary.config["@id"];
pion.vocabularies.vocabularies_by_id[id]=pane.vocabulary;
});
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
dojo.declare("plugins.protocols.ProtocolPane",[dijit.layout.ContentPane,dijit._Templated],{templateString:"<div class='protocol_pane' dojoAttachPoint='containerNode'\r\n\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t><br/\r\n\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t><td rowspan=\"4\" valign=\"top\"><textarea rows=\"4\" name=\"Comment\" class=\"comment\"></textarea></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t><td rowspan=\"3\">&nbsp;</td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Plugin\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"EventType\"\r\n\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" query=\"{Type: 'object'}\" /></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t\t><br/\r\n\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"border: 1px solid #999999;\" width=\"99%\"\r\n\t\t\t><tr\r\n\t\t\t\t><td class=\"matrixMainHeader\">Extraction Rules</td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td style=\"background-color: #f1f1f1;\"\r\n\t\t\t\t\t><div class=\"protocol_grid plugin_pane_grid\" dojoAttachPoint=\"extraction_rule_grid_node\"></div\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"add_new_row\" dojoAttachEvent=\"onClick: _handleAddNewRule\">ADD NEW RULE</button\r\n\t\t\t\t></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick:save\">Save Changes</button\r\n\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick:cancel\">Cancel Changes</button\r\n\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick:delete2\">Delete Protocol</button\r\n\t\t></div\r\n\t></form\r\n></div>\r\n",postMixInProperties:function(){
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
var _18d0={};
var _18d1=store.getAttributes(item);
for(var i=0;i<_18d1.length;++i){
if(dojo.indexOf(this.special_config_elements,_18d1[i])==-1){
_18d0[_18d1[i]]=store.getValue(item,_18d1[i]).toString();
}
}
if(this._addCustomConfigValues){
this._addCustomConfigValues(_18d0,item);
}
this.form.attr("value",_18d0);
var _18d3=dojo.query("textarea.comment",this.form.domNode)[0];
_18d3.value=_18d0.Comment;
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
dojo.forEach(store.getValues(item,"Extract"),function(_18d9){
var _18da={ID:_this.extraction_rule_store.next_id++,Term:store.getValue(_18d9,"@term"),Source:store.getValue(_18d9,"Source"),Name:store.getValue(_18d9,"Name"),Match:store.getValue(_18d9,"Match"),Format:store.getValue(_18d9,"Format"),ContentType:store.getValue(_18d9,"ContentType"),MaxSize:store.getValue(_18d9,"MaxSize")};
_this.extraction_rule_store.newItem(_18da);
});
},onError:pion.handleFetchError});
this.extraction_rule_grid.resize();
},_handleCellEdit:function(_18db,_18dc,_18dd){
console.debug("ProtocolPane._handleCellEdit inValue = ",_18db,", inRowIndex = ",_18dc,", inFieldIndex = ",_18dd);
dojo.addClass(this.domNode,"unsaved_changes");
},_handleAddNewRule:function(){
this.markAsChanged();
this.extraction_rule_store.newItem({ID:this.extraction_rule_store.next_id++});
},save:function(){
if(this.has_extraction_rules){
var _this=this;
var _18df="";
var store=this.extraction_rule_store;
store.fetch({onItem:function(item){
_18df+="<Extract term=\""+store.getValue(item,"Term")+"\">";
_18df+=pion.makeXmlLeafElement("Source",store.getValue(item,"Source"));
if(store.getValue(item,"Name")){
_18df+=pion.makeXmlLeafElement("Name",store.getValue(item,"Name"));
}
if(store.getValue(item,"Match")){
_18df+=pion.makeXmlLeafElement("Match",store.getValue(item,"Match"));
}
if(store.getValue(item,"Format")){
_18df+=pion.makeXmlLeafElement("Format",store.getValue(item,"Format"));
}
if(store.getValue(item,"ContentType")){
_18df+=pion.makeXmlLeafElement("ContentType",store.getValue(item,"ContentType"));
}
if(store.getValue(item,"MaxSize")){
_18df+=pion.makeXmlLeafElement("MaxSize",store.getValue(item,"MaxSize"));
}
_18df+="</Extract>";
},onComplete:function(){
_this.extraction_rule_put_data=_18df;
_this.doPutRequest();
dojo.removeClass(_this.domNode,"unsaved_changes");
},onError:pion.handleFetchError});
}else{
this.extraction_rule_put_data="";
this.doPutRequest();
}
},doPutRequest:function(){
var _18e2=this.form.attr("value");
var _18e3=dojo.query("textarea.comment",this.form.domNode)[0];
_18e2.Comment=_18e3.value;
var _18e4="<PionConfig><Protocol>";
for(var tag in _18e2){
if(tag.charAt(0)!="@"&&tag!="options"){
console.debug("config[",tag,"] = ",_18e2[tag]);
_18e4+=pion.makeXmlLeafElement(tag,_18e2[tag]);
}
}
if(this._makeCustomElements){
_18e4+=this._makeCustomElements(_18e2);
}
_18e4+=this.extraction_rule_put_data;
_18e4+="</Protocol></PionConfig>";
console.debug("put_data: ",_18e4);
_this=this;
dojo.rawXhrPut({url:"/config/protocols/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:_18e4,load:function(_18e6){
console.debug("response: ",_18e6);
pion.protocols.config_store.fetch({query:{"@id":_this.uuid},onItem:function(item){
_this.config_item=item;
_this.populateFromConfigItem(item);
},onError:pion.handleFetchError});
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_18e4})});
},cancel:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.populateFromConfigItem(this.config_item);
},delete2:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
console.debug("delete2: selected protocol is ",this.title);
_this=this;
dojo.xhrDelete({url:"/config/protocols/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_18e8,_18e9){
console.debug("xhrDelete for url = /config/protocols/"+this.uuid,"; HTTP status code: ",_18e9.xhr.status);
dijit.byId("protocol_config_accordion").forward();
dijit.byId("protocol_config_accordion").removeChild(_this);
pion.protocols._adjustAccordionSize();
return _18e8;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
},markAsChanged:function(){
console.debug("markAsChanged");
dojo.addClass(this.domNode,"unsaved_changes");
},protocol:""});
plugins.protocols.source_options=["query","cookie","cs-cookie","sc-cookie","cs-header","sc-header","cs-content","sc-content","cs-raw-content","sc-raw-content"];
}
if(!dojo._hasResource["plugins.protocols.HTTPProtocol"]){
dojo._hasResource["plugins.protocols.HTTPProtocol"]=true;
dojo.provide("plugins.protocols.HTTPProtocol");
plugins.protocols.HTTPProtocol.label="HTTP Protocol";
dojo.declare("plugins.protocols.HTTPProtocolPane",[plugins.protocols.ProtocolPane],{templateString:"<div class='protocol_pane' dojoAttachPoint='containerNode'\r\n\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t><br /\r\n\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t><td rowspan=\"4\" valign=\"top\"><textarea rows=\"4\" name=\"Comment\" class=\"comment\"></textarea></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t><td rowspan=\"3\">&nbsp;</td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Plugin\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"EventType\"\r\n\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" query=\"{Type: 'object'}\" /></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Max&nbsp;Request&nbsp;Content&nbsp;Length</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.ValidationTextBox\" type=\"text\" name=\"MaxRequestContentLength\" regExp=\"[1-9][0-9]*\" required=\"true\" /></td\r\n\t\t\t\t><td></td\r\n\t\t\t\t><td align=\"right\"><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"RawRequestHeaders\" /></td\r\n\t\t\t\t><td><label>Save&nbsp;Raw&nbsp;Request&nbsp;Headers</label></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Max&nbsp;Response&nbsp;Content&nbsp;Length</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.ValidationTextBox\" type=\"text\" name=\"MaxResponseContentLength\" regExp=\"[1-9][0-9]*\" required=\"true\" /></td\r\n\t\t\t\t><td></td\r\n\t\t\t\t><td align=\"right\"><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"RawResponseHeaders\" /></td\r\n\t\t\t\t><td><label>Save&nbsp;Raw&nbsp;Response&nbsp;Headers</label></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t\t><br/\r\n\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"border: 1px solid #999999;\" width=\"99%\"\r\n\t\t\t><tr\r\n\t\t\t\t><td class=\"matrixMainHeader\">Extraction Rules</td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td style=\"background-color: #f1f1f1;\"\r\n\t\t\t\t\t><div class=\"protocol_grid plugin_pane_grid\" dojoAttachPoint=\"extraction_rule_grid_node\"></div\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"add_new_row\" dojoAttachEvent=\"onClick: _handleAddNewRule\">ADD NEW RULE</button\r\n\t\t\t\t></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick:save\">Save Changes</button\r\n\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick:cancel\">Cancel Changes</button\r\n\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick:delete2\">Delete Protocol</button\r\n\t\t></div\r\n\t></form\r\n></div>\r\n",postMixInProperties:function(){
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
},_addCustomConfigValues:function(_18ea,item){
var store=pion.codecs.config_store;
_18ea.options=[];
if(store.hasAttribute(item,"RawRequestHeaders")){
if(store.getValue(item,"RawRequestHeaders").toString()=="true"){
_18ea.options.push("RawRequestHeaders");
}
}
if(store.hasAttribute(item,"RawResponseHeaders")){
if(store.getValue(item,"RawResponseHeaders").toString()=="true"){
_18ea.options.push("RawResponseHeaders");
}
}
},_makeCustomElements:function(_18ed){
var _18ee="<RawRequestHeaders>";
_18ee+=(dojo.indexOf(_18ed.options,"RawRequestHeaders")!=-1);
_18ee+="</RawRequestHeaders><RawResponseHeaders>";
_18ee+=(dojo.indexOf(_18ed.options,"RawResponseHeaders")!=-1);
_18ee+="</RawResponseHeaders>";
return _18ee;
}});
}
if(!dojo._hasResource["pion.protocols"]){
dojo._hasResource["pion.protocols"]=true;
dojo.provide("pion.protocols");
pion.protocols.getHeight=function(){
return pion.protocols.height;
};
pion.protocols.config_store=new dojox.data.XmlStore({url:"/config/protocols"});
pion.protocols.config_store.fetchItemByIdentity=function(_18ef){
pion.protocols.config_store.fetch({query:{"@id":_18ef.identity},onItem:_18ef.onItem,onError:pion.handleFetchError});
};
pion.protocols.config_store.getIdentity=function(item){
return pion.protocols.config_store.getValue(item,"@id");
};
pion.protocols.default_id="593f044a-ac60-11dd-aba3-001cc02bd66b";
pion.protocols.init=function(){
pion.protocols.selected_pane=null;
pion.protocols.config_accordion=dijit.byId("protocol_config_accordion");
pion.protocols.getAllProtocolsInUIDirectory=function(){
var d=new dojo.Deferred();
var store=new dojox.data.XmlStore({url:"/config/protocols/plugins"});
store.fetch({onComplete:function(items){
var _18f4=dojo.map(items,function(item){
return store.getValue(item,"Plugin").toString();
});
d.callback(_18f4);
}});
return d;
};
var _18f6=function(_18f7){
var d=new dojo.Deferred();
plugin_data_store_items=[];
dojo.forEach(_18f7,function(_18f9){
if(dojo.indexOf(pion.plugins.available_plugins,_18f9)!=-1){
var _18fa=pion.plugins.getPluginPrototype("plugins.protocols",_18f9,"/plugins/protocols");
plugin_data_store_items.push({plugin:_18f9,label:_18fa.label});
}
pion.protocols.plugin_data_store=new dojo.data.ItemFileWriteStore({data:{identifier:"plugin",items:plugin_data_store_items}});
});
d.callback();
return d;
};
var _18fb=function(){
pion.protocols.config_store.fetch({onComplete:function(items,_18fd){
pion.protocols.config_accordion.createPanesFromAllItems(items,pion.protocols.config_store);
},onError:pion.handleFetchError});
};
pion.plugins.initAvailablePluginList().addCallback(pion.protocols.getAllProtocolsInUIDirectory).addCallback(_18f6).addCallback(_18fb);
pion.protocols._replaceAccordionPane=function(_18fe){
var _18ff=pion.protocols.config_store.getValue(_18fe.config_item,"Plugin");
var _1900="plugins.protocols."+_18ff+"Pane";
var _1901=dojo.getObject(_1900);
if(_1901){
console.debug("found class ",_1900);
var _1902=new _1901({title:_18fe.title});
}else{
console.debug("class ",_1900," not found; using plugins.protocols.ProtocolPane instead.");
var _1902=new plugins.protocols.ProtocolPane({title:_18fe.title});
}
_1902.uuid=_18fe.uuid;
_1902.config_item=_18fe.config_item;
_1902.initialized=true;
var _1903=dijit.byId("protocol_config_accordion");
var idx=_1903.getIndexOfChild(_18fe);
_1903.pendingSelection=_1902;
_1903.pendingRemoval=_18fe;
_1903.addChild(_1902,idx);
};
pion.protocols._updatePane=function(pane){
console.debug("Fetching item ",pane.uuid);
var store=pion.protocols.config_store;
store.fetch({query:{"@id":pane.uuid},onItem:function(item){
console.debug("item: ",item);
pane.populateFromConfigItem(item);
},onError:pion.handleFetchError});
pion.protocols._adjustAccordionSize();
dojo.style(pane.containerNode,"overflow","hidden");
};
function _1908(pane){
console.debug("Selected "+pane.title);
var _190a=pion.protocols.selected_pane;
if(pane==_190a){
return;
}
var _190b=dijit.byId("protocol_config_accordion");
if(_190a&&dojo.hasClass(_190a.domNode,"unsaved_changes")){
var _190c=new dijit.Dialog({title:"Warning: unsaved changes"});
_190c.attr("content","Please save or cancel unsaved changes before selecting another Protocol.");
_190c.show();
setTimeout(function(){
_190b.selectChild(_190a);
},500);
return;
}
setTimeout(function(){
if(_190b.pendingRemoval){
_190b.removeChild(_190b.pendingRemoval);
_190b.pendingRemoval=false;
}
if(!pane.initialized){
pion.protocols._replaceAccordionPane(pane);
}else{
pion.protocols.selected_pane=pane;
pion.protocols._updatePane(pane);
}
},_190b.duration+100);
};
function _190d(pane){
var _190f=dijit.byId("protocol_config_accordion");
setTimeout(function(){
if(_190f.pendingSelection){
_190f.selectChild(_190f.pendingSelection);
_190f.pendingSelection=false;
}
},_190f.duration);
};
function _1910(pane){
};
dojo.subscribe("protocol_config_accordion-selectChild",_1908);
dojo.subscribe("protocol_config_accordion-addChild",_190d);
dojo.subscribe("protocol_config_accordion-removeChild",_1910);
pion.protocols.createNewPaneFromStore=function(id,_1913){
pion.protocols.config_store.fetch({query:{"@id":id},onItem:function(item){
var _1915=pion.protocols.config_accordion.createNewPaneFromItem(item,pion.protocols.config_store);
if(_1913){
pion.protocols._adjustAccordionSize();
dijit.byId("protocol_config_accordion").selectChild(_1915);
}
},onError:pion.handleFetchError});
};
function _1916(){
var _1917=new plugins.protocols.ProtocolInitDialog({title:"Add New Protocol"});
setTimeout(function(){
dojo.query("input",_1917.domNode)[0].select();
},500);
_1917.show();
_1917.execute=function(_1918){
if(this.execute_already_called){
console.debug("See http://trac.atomiclabs.com/ticket/685.");
return;
}
this.execute_already_called=true;
if(pion.key_service_running&&plugins.protocols[_1918.Plugin]&&plugins.protocols[_1918.Plugin].edition=="Enterprise"){
pion.about.checkKeyStatus({success_callback:function(){
_1919(_1918);
}});
}else{
_1919(_1918);
}
};
};
function _1919(_191a){
var _191b="<PionConfig><Protocol>";
for(var tag in _191a){
console.debug("dialogFields[",tag,"] = ",_191a[tag]);
_191b+=pion.makeXmlLeafElement(tag,_191a[tag]);
}
if(plugins.protocols[_191a.Plugin]&&plugins.protocols[_191a.Plugin].custom_post_data){
_191b+=plugins.protocols[_191a.Plugin].custom_post_data;
}
_191b+="</Protocol></PionConfig>";
console.debug("post_data: ",_191b);
dojo.rawXhrPost({url:"/config/protocols",contentType:"text/xml",handleAs:"xml",postData:_191b,load:function(_191d){
var node=_191d.getElementsByTagName("Protocol")[0];
var id=node.getAttribute("id");
console.debug("id (from server): ",id);
pion.protocols.createNewPaneFromStore(id,true);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_191b})});
};
dojo.connect(dojo.byId("add_new_protocol_button"),"click",_1916);
};
pion.protocols._adjustAccordionSize=function(){
var _1920=dijit.byId("protocol_config_accordion");
var _1921=pion.protocols.selected_pane.getHeight();
dojo.forEach(_1920.getChildren(),function(pane){
_1921+=pane._buttonWidget.getTitleHeight();
});
_1920.resize({h:_1921});
pion.protocols.height=_1921+160;
dijit.byId("main_stack_container").resize({h:pion.protocols.height});
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
dojo.declare("pion.widgets.UserPane",[dijit.layout.ContentPane,dijit._Templated],{templateString:"<div class='user_pane' dojoAttachPoint='containerNode'\r\n\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t><br/\r\n\t\t><div\r\n\t\t\t><div style=\"float: left\"\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"275px\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Username</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Last name</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"LastName\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>First name</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"FirstName\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Password</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Password\" type=\"password\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t></div\r\n\t\t\t><div style=\"float: right; margin-top: -15px\"\r\n\t\t\t\t><label>Visible Configuration Tabs</label><br /\r\n\t\t\t\t><input dojoType=\"dijit.form.CheckBox\" name=\"tab_check_boxes\" value=\"reactor_config\" />Reactors<br /\r\n\t\t\t\t><input dojoType=\"dijit.form.CheckBox\" name=\"tab_check_boxes\" value=\"vocab_config\" />Vocabularies<br /\r\n\t\t\t\t><input dojoType=\"dijit.form.CheckBox\" name=\"tab_check_boxes\" value=\"codec_config\" />Codecs<br /\r\n\t\t\t\t><input dojoType=\"dijit.form.CheckBox\" name=\"tab_check_boxes\" value=\"database_config\" />Databases<br /\r\n\t\t\t\t><input dojoType=\"dijit.form.CheckBox\" name=\"tab_check_boxes\" value=\"protocol_config\" />Protocols<br /\r\n\t\t\t\t><input dojoType=\"dijit.form.CheckBox\" name=\"tab_check_boxes\" value=\"user_config\" dojoAttachEvent=\"onClick: _warnIfDisablingSelf\" />Users<br /\r\n\t\t\t\t><input dojoType=\"dijit.form.CheckBox\" name=\"tab_check_boxes\" value=\"system_config\" />System<br /\r\n\t\t\t></div\r\n\t\t\t><div style=\"float: right; margin-right: 50px\" dojoAttachPoint=\"visible_service_tabs\"\r\n\t\t\t></div\r\n\t\t\t><div style=\"clear: both\"></div\r\n\t\t></div\r\n\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick:save\">Save Changes</button\r\n\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick:cancel\">Cancel Changes</button\r\n\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick:delete2\">Delete User</button\r\n\t\t></div\r\n\t></form\r\n></div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
for(var id in pion.services.labels_by_tab_id){
var _1924=document.createElement("div");
this.visible_service_tabs.appendChild(_1924);
new dijit.form.CheckBox({name:"tab_check_boxes",value:id},_1924);
var _1925=dojo.create("label",{innerHTML:"Show "+pion.services.labels_by_tab_id[id]+" tab"});
this.visible_service_tabs.appendChild(_1925);
this.visible_service_tabs.appendChild(dojo.create("br"));
}
},getHeight:function(){
return dojo.isIE?225:205;
},populateFromConfigItem:function(item){
var store=pion.users.config_store;
var _1928={};
var _1929=store.getAttributes(item);
for(var i=0;i<_1929.length;++i){
if(_1929[i]!="Permit"&&_1929[i]!="tagName"&&_1929[i]!="childNodes"){
_1928[_1929[i]]=store.getValue(item,_1929[i]).toString();
}
}
_1928.tab_check_boxes=[];
dojo.forEach(store.getValues(item,"Permit"),function(_192b){
_1928.tab_check_boxes.push(pion.tab_ids_by_resource[_192b.toString()]);
});
console.dir(_1928);
this.form.attr("value",_1928);
var node=this.domNode;
setTimeout(function(){
dojo.removeClass(node,"unsaved_changes");
},500);
},save:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
var _192d=this.form.attr("value");
var _192e="<PionConfig><User>";
for(var tag in _192d){
if(tag!="@id"&&tag!="tab_check_boxes"){
console.debug("config[",tag,"] = ",_192d[tag]);
_192e+=pion.makeXmlLeafElement(tag,_192d[tag]);
}
}
dojo.forEach(_192d.tab_check_boxes,function(_1930){
_192e+="<Permit>"+pion.resources_by_tab_id[_1930]+"</Permit>";
});
_192e+="</User></PionConfig>";
console.debug("put_data: ",_192e);
_this=this;
dojo.rawXhrPut({url:"/config/users/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:_192e,load:function(_1931){
console.debug("response: ",_1931);
pion.users.config_store.fetch({query:{"@id":_this.uuid},onItem:function(item){
_this.config_item=item;
_this.populateFromConfigItem(item);
},onError:pion.handleFetchError});
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_192e})});
},cancel:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.populateFromConfigItem(this.config_item);
},delete2:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
console.debug("delete2: selected user is ",this.title);
_this=this;
dojo.xhrDelete({url:"/config/users/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_1933,_1934){
console.debug("xhrDelete for url = /config/users/"+this.uuid,"; HTTP status code: ",_1934.xhr.status);
dijit.byId("user_config_accordion").forward();
dijit.byId("user_config_accordion").removeChild(_this);
pion.users._adjustAccordionSize();
return _1933;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
},markAsChanged:function(){
console.debug("markAsChanged");
dojo.addClass(this.domNode,"unsaved_changes");
},_warnIfDisablingSelf:function(e){
},user:""});
}
if(!dojo._hasResource["pion.users"]){
dojo._hasResource["pion.users"]=true;
dojo.provide("pion.users");
pion.users.getHeight=function(){
return pion.users.height;
};
pion.users.config_store=new dojox.data.XmlStore({url:"/config/users"});
pion.users.init=function(){
pion.users.selected_pane=null;
pion.users.config_accordion=dijit.byId("user_config_accordion");
pion.users.config_accordion.title_attribute="@id";
pion.users._replaceAccordionPane=function(_1936){
var _1937=new pion.widgets.UserPane({title:_1936.title});
_1937.uuid=_1936.uuid;
_1937.config_item=_1936.config_item;
_1937.initialized=true;
var _1938=dijit.byId("user_config_accordion");
var idx=_1938.getIndexOfChild(_1936);
_1938.pendingSelection=_1937;
_1938.pendingRemoval=_1936;
_1938.addChild(_1937,idx);
};
pion.users._updatePane=function(pane){
console.debug("Fetching item ",pane.uuid);
var store=pion.users.config_store;
store.fetch({query:{"@id":pane.uuid},onItem:function(item){
console.debug("item: ",item);
pane.populateFromConfigItem(item);
},onError:pion.handleFetchError});
pion.users._adjustAccordionSize();
dojo.style(pane.containerNode,"overflow","hidden");
};
function _193d(pane){
console.debug("Selected "+pane.title);
var _193f=pion.users.selected_pane;
if(pane==_193f){
return;
}
var _1940=dijit.byId("user_config_accordion");
if(_193f&&dojo.hasClass(_193f.domNode,"unsaved_changes")){
var _1941=new dijit.Dialog({title:"Warning: unsaved changes"});
_1941.attr("content","Please save or cancel unsaved changes before selecting another User.");
_1941.show();
setTimeout(function(){
_1940.selectChild(_193f);
},500);
return;
}
setTimeout(function(){
if(_1940.pendingRemoval){
_1940.removeChild(_1940.pendingRemoval);
_1940.pendingRemoval=false;
}
if(!pane.initialized){
pion.users._replaceAccordionPane(pane);
}else{
pion.users.selected_pane=pane;
pion.users._updatePane(pane);
}
},_1940.duration+100);
};
function _1942(pane){
var _1944=dijit.byId("user_config_accordion");
setTimeout(function(){
if(_1944.pendingSelection){
_1944.selectChild(_1944.pendingSelection);
_1944.pendingSelection=false;
}
},_1944.duration);
};
function _1945(pane){
};
dojo.subscribe("user_config_accordion-selectChild",_193d);
dojo.subscribe("user_config_accordion-addChild",_1942);
dojo.subscribe("user_config_accordion-removeChild",_1945);
pion.users.createNewPaneFromStore=function(id,_1948){
pion.users.config_store.fetch({query:{"@id":id},onItem:function(item){
var _194a=pion.users.config_accordion.createNewPaneFromItem(item,pion.users.config_store);
if(_1948){
pion.users._adjustAccordionSize();
dijit.byId("user_config_accordion").selectChild(_194a);
}
},onError:pion.handleFetchError});
};
function _194b(items,_194d){
pion.users.config_accordion.createPanesFromAllItems(items,pion.users.config_store);
};
if(file_protocol){
dijit.byId("user_config_accordion").removeChild(selected_user_pane);
}else{
pion.users.config_store.fetch({onComplete:_194b,onError:pion.handleFetchError});
}
function _194e(){
var _194f=new pion.widgets.UserInitDialog();
setTimeout(function(){
dojo.query("input",_194f.domNode)[0].select();
},500);
_194f.show();
_194f.execute=function(_1950){
if(this.execute_already_called){
console.debug("See http://trac.atomiclabs.com/ticket/685.");
return;
}
this.execute_already_called=true;
console.debug(_1950);
var id=_1950["@id"];
delete _1950["@id"];
var _1952="<PionConfig><User id=\""+pion.escapeXml(id)+"\">";
for(var tag in _1950){
console.debug("dialogFields[",tag,"] = ",_1950[tag]);
_1952+=pion.makeXmlLeafElement(tag,_1950[tag]);
}
for(var _1954 in pion.tab_ids_by_resource){
_1952+="<Permit>"+_1954+"</Permit>";
}
_1952+="</User></PionConfig>";
console.debug("post_data: ",_1952);
dojo.rawXhrPost({url:"/config/users",contentType:"text/xml",handleAs:"xml",postData:_1952,load:function(_1955){
pion.users.createNewPaneFromStore(id,true);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1952})});
};
};
dojo.connect(dojo.byId("add_new_user_button"),"click",_194e);
};
pion.users._adjustAccordionSize=function(){
var _1956=dijit.byId("user_config_accordion");
var _1957=pion.users.selected_pane.getHeight();
dojo.forEach(_1956.getChildren(),function(pane){
_1957+=pane._buttonWidget.getTitleHeight();
});
_1956.resize({h:_1957});
pion.users.height=_1957+160;
dijit.byId("main_stack_container").resize({h:pion.users.height});
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
var _1959="<PionConfig>"+this.XML_text_area.value+"</PionConfig>";
var _195a=_1959.replace(/>\s*/g,">");
if(dojo.isIE){
var _195b=dojox.data.dom.createDocument();
_195b.loadXML(_195a);
}else{
var _195c=new DOMParser();
var _195b=_195c.parseFromString(_195a,"text/xml");
}
var _195d=_195b.childNodes[0].childNodes;
this.result_text_area.value+=_195d.length+" configurations found.\n";
this.configs_by_type={Codec:[],Database:[],Reactor:[],Connection:[]};
for(var i=0;i<_195d.length;++i){
var type=_195d[i].nodeName;
if(!this.configs_by_type[type]){
this.result_text_area.value+="Error: unknown configuration type \""+type+"\".\n";
return;
}
this.configs_by_type[type].push(_195d[i]);
}
this.processCodecs();
},processCodecs:function(){
if(this.configs_by_type.Codec.length==0){
this.result_text_area.value+="No Codec configurations found.\n";
this.processDatabases();
}else{
this.result_text_area.value+=this.configs_by_type.Codec.length+" Codec configurations found.\n";
var _1960=0;
var _this=this;
dojo.forEach(this.configs_by_type.Codec,function(_1962){
var _1963=_1962.getAttribute("id");
var _1964="<PionConfig>"+dojox.data.dom.innerXML(_1962)+"</PionConfig>";
dojo.rawXhrPost({url:"/config/codecs",contentType:"text/xml",handleAs:"xml",postData:_1964,load:function(_1965){
var node=_1965.getElementsByTagName("Codec")[0];
var _1967=node.getAttribute("id");
if(_1963){
_this.uuid_replacements[_1963]=_1967;
}
if(codec_config_page_initialized){
pion.codecs.createNewPaneFromStore(_1967,false);
}
var name=node.getElementsByTagName("Name")[0].childNodes[0].nodeValue;
_this.result_text_area.value+="Codec named \""+name+"\" added with new UUID "+_1967+"\n";
if(++_1960==_this.configs_by_type.Codec.length){
_this.processDatabases();
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1964})});
});
}
},processDatabases:function(){
if(this.configs_by_type.Database.length==0){
this.result_text_area.value+="No Database configurations found.\n";
this.processReactors();
}else{
this.result_text_area.value+=this.configs_by_type.Database.length+" Database configurations found.\n";
var _1969=0;
var _this=this;
dojo.forEach(this.configs_by_type.Database,function(_196b){
var _196c=_196b.getAttribute("id");
var _196d="<PionConfig>"+dojox.data.dom.innerXML(_196b)+"</PionConfig>";
dojo.rawXhrPost({url:"/config/databases",contentType:"text/xml",handleAs:"xml",postData:_196d,load:function(_196e){
var node=_196e.getElementsByTagName("Database")[0];
var _1970=node.getAttribute("id");
if(_196c){
_this.uuid_replacements[_196c]=_1970;
}
if(database_config_page_initialized){
pion.databases.createNewPaneFromStore(_1970,false);
}
var name=node.getElementsByTagName("Name")[0].childNodes[0].nodeValue;
_this.result_text_area.value+="Database named \""+name+"\" added with new UUID "+_1970+"\n";
if(++_1969==_this.configs_by_type.Database.length){
_this.processReactors();
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_196d})});
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
var _1972=0;
var _this=this;
dojo.forEach(this.configs_by_type.Reactor,function(_1974){
var _1975=_1974.getAttribute("id");
var _1976="<PionConfig>"+dojox.data.dom.innerXML(_1974)+"</PionConfig>";
for(var _1977 in _this.uuid_replacements){
_1976=_1976.replace(RegExp(_1977,"g"),_this.uuid_replacements[_1977]);
}
console.debug("post_data = ",_1976);
dojo.rawXhrPost({url:"/config/reactors",contentType:"text/xml",handleAs:"xml",postData:_1976,load:function(_1978){
var node=_1978.getElementsByTagName("Reactor")[0];
var _197a=node.getAttribute("id");
if(_1975){
_this.uuid_replacements[_1975]=_197a;
}
var _197b={"@id":_197a};
var _197c=node.childNodes;
for(var i=0;i<_197c.length;++i){
if(_197c[i].firstChild){
_197b[_197c[i].tagName]=_197c[i].firstChild.nodeValue;
}
}
pion.reactors.createReactorInConfiguredWorkspace(_197b);
_this.result_text_area.value+="Reactor named \""+_197b.Name+"\" added with new UUID "+_197a+"\n";
if(++_1972==_this.configs_by_type.Reactor.length){
dijit.byId("main_stack_container").selectChild(dijit.byId("system_config"));
console.debug("this.uuid_replacements = ",this.uuid_replacements);
_this.processConnections();
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1976})});
});
}
},processConnections:function(){
if(this.configs_by_type.Connection.length==0){
this.result_text_area.value+="No Connection configurations found.\n";
}else{
dijit.byId("main_stack_container").selectChild(dijit.byId("reactor_config"));
this.result_text_area.value+=this.configs_by_type.Connection.length+" Connections found.\n";
var _197e=0;
var _this=this;
dojo.forEach(this.configs_by_type.Connection,function(_1980){
var _1981=_1980.getAttribute("id");
var _1982="<PionConfig>"+dojox.data.dom.innerXML(_1980)+"</PionConfig>";
for(var _1983 in _this.uuid_replacements){
_1982=_1982.replace(RegExp(_1983,"g"),_this.uuid_replacements[_1983]);
}
console.debug("post_data = ",_1982);
dojo.rawXhrPost({url:"/config/connections",contentType:"text/xml",handleAs:"xml",postData:_1982,load:function(_1984){
var node=_1984.getElementsByTagName("Connection")[0];
var _1986=node.getAttribute("id");
var _1987=_1984.getElementsByTagName("From")[0].firstChild.nodeValue;
var to_id=_1984.getElementsByTagName("To")[0].firstChild.nodeValue;
pion.reactors.createConnection(_1987,to_id,_1986);
_this.result_text_area.value+="Connection from "+_1987+" to "+to_id+" added with new UUID "+_1986+"\n";
if(++_197e==_this.configs_by_type.Connection.length){
dijit.byId("main_stack_container").selectChild(dijit.byId("system_config"));
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1982})});
});
}
}});
}
if(!dojo._hasResource["pion.system"]){
dojo._hasResource["pion.system"]=true;
dojo.provide("pion.system");
var server_store;
dojo.declare("childlessChildrenFirstStore",dojo.data.ItemFileWriteStore,{getValues:function(item,_198a){
var _198b=this.inherited("getValues",arguments);
if(_198a!="services"){
return _198b;
}
var len=_198b.length;
for(var i=0;i<len;++i){
if(_198b[0].services){
_198b.push(_198b[0]);
_198b.splice(0,1);
}
}
return _198b;
}});
pion.system.getHeight=function(){
return 800;
};
pion.system.init=function(){
dijit.byId("main_stack_container").resize({h:pion.system.getHeight()});
if(file_protocol){
return;
}
dojo.xhrGet({url:"/config",handleAs:"xml",timeout:5000,load:function(_198e,_198f){
console.debug("in load()");
if(dojo.isIE){
dojo.byId("platform_conf_file").innerHTML=_198e.getElementsByTagName("PlatformConfig")[0].xml;
dojo.byId("reactor_conf_file").innerHTML=_198e.getElementsByTagName("ReactorConfig")[0].xml;
dojo.byId("vocab_conf_file").innerHTML=_198e.getElementsByTagName("VocabularyConfig")[0].xml;
dojo.byId("codec_conf_file").innerHTML=_198e.getElementsByTagName("CodecConfig")[0].xml;
dojo.byId("database_conf_file").innerHTML=_198e.getElementsByTagName("DatabaseConfig")[0].xml;
dojo.byId("user_conf_file").innerHTML=_198e.getElementsByTagName("UserConfig")[0].xml;
dojo.byId("protocol_conf_file").innerHTML=_198e.getElementsByTagName("ProtocolConfig")[0].xml;
dojo.byId("service_conf_file").innerHTML=_198e.getElementsByTagName("ServiceConfig")[0].xml;
dojo.byId("log_conf_file").innerHTML=_198e.getElementsByTagName("LogConfig")[0].xml;
dojo.byId("vocab_path").innerHTML=_198e.getElementsByTagName("VocabularyPath")[0].xml;
dojo.byId("data_directory").innerHTML=_198e.getElementsByTagName("DataDirectory")[0].xml;
}else{
dojo.byId("platform_conf_file").innerHTML=_198e.getElementsByTagName("PlatformConfig")[0].textContent;
dojo.byId("reactor_conf_file").innerHTML=_198e.getElementsByTagName("ReactorConfig")[0].textContent;
dojo.byId("vocab_conf_file").innerHTML=_198e.getElementsByTagName("VocabularyConfig")[0].textContent;
dojo.byId("codec_conf_file").innerHTML=_198e.getElementsByTagName("CodecConfig")[0].textContent;
dojo.byId("database_conf_file").innerHTML=_198e.getElementsByTagName("DatabaseConfig")[0].textContent;
dojo.byId("user_conf_file").innerHTML=_198e.getElementsByTagName("UserConfig")[0].textContent;
dojo.byId("protocol_conf_file").innerHTML=_198e.getElementsByTagName("ProtocolConfig")[0].textContent;
dojo.byId("service_conf_file").innerHTML=_198e.getElementsByTagName("ServiceConfig")[0].textContent;
dojo.byId("log_conf_file").innerHTML=_198e.getElementsByTagName("LogConfig")[0].textContent;
dojo.byId("vocab_path").innerHTML=_198e.getElementsByTagName("VocabularyPath")[0].textContent;
dojo.byId("data_directory").innerHTML=_198e.getElementsByTagName("DataDirectory")[0].textContent;
}
var _1990=dojo.byId("plugin_paths");
var _1991=_1990.getElementsByTagName("tr")[0];
while(_1990.firstChild){
_1990.removeChild(_1990.firstChild);
}
var _1992=_198e.getElementsByTagName("PluginPath");
var _1993=[];
for(var i=0;i<_1992.length;++i){
if(dojo.isIE){
_1993[i]=_1990.insertRow();
dojo.forEach(_1991.childNodes,function(n){
_1993[i].appendChild(dojo.clone(n));
});
}else{
_1993[i]=dojo.clone(_1991);
_1990.appendChild(_1993[i]);
}
_1993[i].getElementsByTagName("label")[0].innerHTML="Plugin Path "+(i+1);
var _1996=dojo.isIE?_1992[i].xml:_1992[i].textContent;
_1993[i].getElementsByTagName("td")[1].innerHTML=_1996;
}
return _198e;
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
var _199b=new pion.widgets.XMLImportDialog();
_199b.show();
};
}
if(!dojo._hasResource["plugins.services.Service"]){
dojo._hasResource["plugins.services.Service"]=true;
dojo.provide("plugins.services.Service");
dojo.declare("plugins.services.Service",[dijit.layout.BorderContainer,dijit._Templated],{postCreate:function(){
this.inherited("postCreate",arguments);
dijit.byId("main_stack_container").addChild(this,0);
pion.services.labels_by_tab_id[this.id]=this.title;
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
pion.services.labels_by_tab_id={};
pion.services.init=function(){
pion.services.getAllServicesInUIDirectory=function(){
var d=new dojo.Deferred();
var store=new dojox.data.XmlStore({url:"/config/services/plugins"});
store.fetch({onComplete:function(items){
var _199f=dojo.map(items,function(item){
return store.getValue(item,"Plugin").toString();
});
d.callback(_199f);
}});
return d;
};
pion.services.getConfiguredServices=function(_19a1){
var d=new dojo.Deferred();
dojo.xhrGet({url:"/config/services",handleAs:"xml",timeout:5000,load:function(_19a3,_19a4){
var _19a5=_19a3.getElementsByTagName("Plugin");
var _19a6=dojo.map(_19a5,function(n){
return dojo.isIE?n.childNodes[0].nodeValue:n.textContent;
});
d.callback({services_in_ui_dir:_19a1,configured_services:_19a6});
return _19a3;
},error:pion.handleXhrGetError});
return d;
};
var _19a8=function(_19a9){
var d=new dojo.Deferred();
var _19ab=[];
dojo.forEach(_19a9.services_in_ui_dir,function(_19ac){
if(dojo.indexOf(_19a9.configured_services,_19ac)!=-1){
if(dojo.indexOf(pion.plugins.available_plugins,_19ac)!=-1){
var _19ad=pion.plugins.getPluginPrototype("plugins.services",_19ac,"/plugins/services");
if("isUsable" in _19ad){
_19ab.push(_19ad);
}else{
new _19ad({title:_19ad.label,id:_19ad.tab_id});
console.debug("UI for service \"",_19ad.label,"\" has been added.");
}
}
}
});
var _19ae=_19ab.length;
if(_19ae==0){
d.callback();
}else{
dojo.forEach(_19ab,function(_19af){
_19af.isUsable().addCallback(function(_19b0){
if(_19b0){
new _19af({title:_19af.label,id:_19af.tab_id});
console.debug("UI for service \"",_19af.label,"\" has been added.");
}else{
console.debug("UI for service \"",_19af.label,"\" has NOT been added: isUsable() returned false.");
}
_19ae--;
if(_19ae==0){
d.callback();
}
}).addErrback(function(e){
console.debug("UI for service \"",_19af.label,"\" has NOT been added: ",e);
_19ae--;
if(_19ae==0){
d.callback();
}
});
});
}
return d;
};
pion.plugins.initAvailablePluginList().addCallback(pion.services.getAllServicesInUIDirectory).addCallback(pion.services.getConfiguredServices).addCallback(_19a8).addCallback(pion.initTabs);
};
}
if(!dojo._hasResource["pion.about"]){
dojo._hasResource["pion.about"]=true;
dojo.provide("pion.about");
pion.about.ops_temporarily_suppressed=false;
dojo.declare("pion.about.LicenseKeyDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog about_dialog\" style=\"height: 550px; width: 600px\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">About Pion</span>\r\n\t\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: hide\">\r\n\t\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<p>\r\n\t\t\t<big><strong><span id=\"full_version\" dojoAttachPoint=\"full_version\"></span></strong></big><br/>\r\n\t\t\tCopyright &copy; 2007-2010 Atomic Labs, Inc.  All Rights Reserved.\r\n\t\t</p>\r\n\t\t<p>\r\n\t\t\tPion includes a collection of <a href=\"third_party_libraries.html\" target=\"_blank\" style=\"color:#0033CC; text-decoration:underline\">third party\r\n\t\t\tlibraries</a>, all of which may be downloaded from \r\n\t\t\t<a href=\"http://pion.org/projects/pion-platform/documentation/libraries\" target=\"_blank\" style=\"color:#0033CC; text-decoration:underline\">our\r\n\t\t\tcommunity website.</a>\r\n\t\t</p>\r\n\r\n\t\t<h2>License Information</h2>\r\n\t\t<hr>\r\n\r\n\t\t<div id=\"license_block\">\r\n\r\n\t\t\t<div id=\"community_license\" dojoAttachPoint=\"community_license\"\r\n\t\t\t\tstyle=\"display: none\">\r\n\r\n\t\t\t\t<p>\r\n\t\t\t\t\tPion Community Edition is licensed under the\r\n\t\t\t\t\t<a href=\"/licenses/gpl_affero.html\" target=\"_blank\" style=\"color:#0033CC; text-decoration:underline\">\r\n\t\t\t\t\t\tGNU Affero\r\n\t\t\t\t\t\tGeneral Public License\r\n\t\t\t\t\t</a>.\r\n\t\t\t\t</p>\r\n\r\n\t\t\t</div>\r\n\r\n\t\t\t<div id=\"enterprise_not_licensed\" dojoAttachPoint=\"enterprise_not_licensed\"\r\n\t\t\t\tstyle=\"display: none\">\r\n\t\t\t\r\n\t\t\t\t<p><span id=\"reason_needs_license\" dojoAttachPoint=\"reason_needs_license\"></span></p>\r\n\r\n\t\t\t\t<form>\r\n\t\t\t\t<p>\r\n\t\t\t\tPlease cut and paste your license key into the box below and click \"Submit Key.\"<br/>\r\n\t\t\t\tIf you don't have a license key, you can obtain one from\r\n\t\t\t\t<a href=\"http://www.atomiclabs.com/pion/download-enterprise.php\" style=\"color:#0033CC; text-decoration:underline\">atomiclabs.com</a>.\r\n\t\t\t\t</p>\r\n\t\t\t\t<textarea id=\"license_key\" dojoAttachPoint=\"license_key\" cols=\"65\" rows=\"8\"></textarea><br/>\r\n\t\t\t\t<button dojoType=\"dijit.form.Button\" class=\"content_button\" dojoAttachEvent=\"onClick: submitKey\">Submit Key</button>\r\n\t\t\t\t</form>\r\n\t\t\t\t<p><big><strong><span id=\"result_of_submitting_key\" dojoAttachPoint=\"result_of_submitting_key\"></span></strong></big></p>\r\n\t\t\t\r\n\t\t\t</div>\r\n\t\t\t\r\n\t\t\t<div id=\"enterprise_licensed\" dojoAttachPoint=\"enterprise_licensed\"\r\n\t\t\t\tstyle=\"display: none\">\r\n\t\t\t\r\n\t\t\t\t<p>Pion Enterprise Edition is licensed under the\r\n\t\t\t\t<a href=\"/licenses/atomic_enterprise.html\" target=\"_blank\" style=\"color:#0033CC; text-decoration:underline\">Atomic Labs\r\n\t\t\t\tEnterprise Software License Agreement</a>.</p>\r\n\t\t\t\t\r\n\t\t\t\t<table>\r\n\t\t\t\t<tr>\r\n\t\t\t\t\t<td><big><strong>Name:</strong></big></td>\r\n\t\t\t\t\t<td><span id=\"license_name\" dojoAttachPoint=\"license_name\"></span></td>\r\n\t\t\t\t</tr>\r\n\t\t\t\t<tr>\r\n\t\t\t\t\t<td><big><strong>Email:</strong></big></td>\r\n\t\t\t\t\t<td><span id=\"license_email\" dojoAttachPoint=\"license_email\"></span></td>\r\n\t\t\t\t</tr>\r\n\t\t\t\t<tr>\r\n\t\t\t\t\t<td><big><strong>Version:</strong></big></td>\r\n\t\t\t\t\t<td><span id=\"license_version\" dojoAttachPoint=\"license_version\"></span></td>\r\n\t\t\t\t</tr>\r\n\t\t\t\t<tr>\r\n\t\t\t\t\t<td><big><strong>Expiration:</strong></big></td>\r\n\t\t\t\t\t<td><span id=\"license_expiration\" dojoAttachPoint=\"license_expiration\"></span></td>\r\n\t\t\t\t</tr>\r\n\t\t\t\t</table>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
var _this=this;
dojo.xhrGet({url:"/config",preventCache:true,handleAs:"xml",timeout:5000,load:function(_19b3,_19b4){
if(dojo.isIE){
var _19b5=_19b3.getElementsByTagName("Version")[0].childNodes[0].nodeValue;
}else{
var _19b5=_19b3.getElementsByTagName("Version")[0].textContent;
}
var _19b6="Unknown";
dojo.xhrGet({url:"/key/status",preventCache:true,handleAs:"xml",timeout:5000,load:function(_19b7,_19b8){
pion.key_service_running=true;
if(dojo.isIE){
var _19b9=_19b7.getElementsByTagName("Status")[0].childNodes[0].nodeValue;
}else{
var _19b9=_19b7.getElementsByTagName("Status")[0].textContent;
}
_19b6="Enterprise";
_this.doLicenseStuff(_19b5,_19b6,_19b9);
return _19b7;
},error:function(_19ba,_19bb){
if(_19bb.xhr.status==404){
_19b6="Community";
_this.doLicenseStuff(_19b5,_19b6,"404");
}
return _19ba;
}});
return _19b3;
}});
this.connect(this,"hide",function(){
this.destroyRecursive(false);
if(_this.always_callback){
_this.always_callback();
}
if(pion.about.ops_temporarily_suppressed){
var _19bc=dijit.byId("ops_toggle_button");
_19bc.attr("checked",false);
pion.about.ops_temporarily_suppressed=false;
}
});
},submitKey:function(e){
var key=this.license_key.value;
console.debug("key = ",key);
var _this=this;
dojo.rawXhrPut({url:"/key",contentType:"text/plain",handleAs:"text",putData:key,load:function(_19c0){
console.debug("response: ",_19c0);
_this.hide();
pion.about.doDialog({always_callback:_this.success_callback});
return _19c0;
},error:function(_19c1,_19c2){
console.debug(_19c2);
_this.result_of_submitting_key.innerHTML="Error: Key not accepted.";
return _19c1;
}});
},doLicenseStuff:function(_19c3,_19c4,_19c5){
console.debug("pion_version = ",_19c3,", pion_edition = ",_19c4,", key_status = ",_19c5);
full_edition_str="Pion "+_19c4+" Edition";
full_version_str=full_edition_str+" v"+_19c3;
this.full_version.innerHTML=full_version_str;
if(_19c4=="Community"){
this.community_license.style.display="block";
}else{
if(_19c5=="valid"){
var _this=this;
dojo.xhrGet({url:"/key",preventCache:true,handleAs:"xml",timeout:5000,load:function(_19c7,_19c8){
if(dojo.isIE){
var _19c9=_19c7.getElementsByTagName("Name")[0].xml;
var _19ca=_19c7.getElementsByTagName("Email")[0].xml;
var _19cb=_19c7.getElementsByTagName("Version");
var _19cc=_19cb.length>0?_19cb[0].xml:"";
var _19cd=_19c7.getElementsByTagName("Expiration");
var _19ce=_19cd.length>0?_19cd[0].xml:"";
}else{
var _19c9=_19c7.getElementsByTagName("Name")[0].textContent;
var _19ca=_19c7.getElementsByTagName("Email")[0].textContent;
var _19cb=_19c7.getElementsByTagName("Version");
var _19cc=_19cb.length>0?_19cb[0].textContent:"";
var _19cd=_19c7.getElementsByTagName("Expiration");
var _19ce=_19cd.length>0?_19cd[0].textContent:"";
}
_this.license_name.innerHTML=_19c9;
_this.license_email.innerHTML=_19ca;
if(_19cc==""){
_this.license_version.innerHTML="All versions";
}else{
_this.license_version.innerHTML=_19cc;
}
if(_19ce==""){
_this.license_expiration.innerHTML="None";
}else{
_this.license_expiration.innerHTML=_19ce;
}
_this.enterprise_licensed.style.display="block";
return _19c7;
},error:pion.handleXhrGetError});
}else{
if(_19c5=="invalid"){
this.reason_needs_license.innerHTML="Invalid license key (may have expired).";
}else{
this.reason_needs_license.innerHTML="No license key found.";
}
this.enterprise_not_licensed.style.display="block";
}
}
}});
pion.about.doDialog=function(_19cf){
var _19d0=dijit.byId("ops_toggle_button");
if(!_19d0.checked){
_19d0.attr("checked",true);
pion.about.ops_temporarily_suppressed=true;
}
var _19d1=new pion.about.LicenseKeyDialog(_19cf);
_19d1.show();
};
pion.about.checkKeyStatus=function(_19d2){
dojo.xhrGet({url:"/key/status",preventCache:true,handleAs:"xml",timeout:5000,load:function(_19d3,_19d4){
pion.key_service_running=true;
if(dojo.isIE){
var _19d5=_19d3.getElementsByTagName("Status")[0].childNodes[0].nodeValue;
}else{
var _19d5=_19d3.getElementsByTagName("Status")[0].textContent;
}
if(_19d5=="valid"){
if(_19d2.always_callback){
_19d2.always_callback();
}
if(_19d2.success_callback){
_19d2.success_callback();
}
}else{
pion.about.doDialog(_19d2);
}
return _19d3;
},error:function(_19d6,_19d7){
if(_19d7.xhr.status==401){
if(!dojo.cookie("logged_in")){
location.replace("login.html");
}
pion.login.doLoginDialog({success_callback:function(){
pion.about.doDialog(_19d2);
},suppress_default_key_status_check:true});
}else{
if(_19d7.xhr.status==404){
pion.key_service_running=false;
if(_19d2.always_callback){
_19d2.always_callback();
}
}else{
pion.about.doDialog(_19d2);
}
}
return _19d6;
}});
};
pion.about.checkKeyStatusDfd=function(){
var dfd=new dojo.Deferred();
dojo.xhrGet({url:"/key/status",preventCache:true,handleAs:"xml",timeout:5000,load:function(_19d9,_19da){
pion.key_service_running=true;
var _19db=_19d9.getElementsByTagName("Status")[0];
var _19dc=dojo.isIE?_19db.childNodes[0].nodeValue:_19db.textContent;
var _19dd=dojo.map(_19d9.getElementsByTagName("Product"),function(p){
return dojox.xml.parser.textContent(p);
});
if(dojo.indexOf(_19dd,"Pion Replay")!=-1){
dfd.callback("replay");
}else{
if(dojo.indexOf(_19dd,"Pion Enterprise")!=-1){
dfd.callback("enterprise");
}else{
dfd.callback("none");
}
}
return _19d9;
},error:function(_19df,_19e0){
if(_19e0.xhr.status==404){
pion.key_service_running=false;
dfd.callback("none");
}else{
if(_19e0.xhr.status==401){
dfd.errback(new Error("Not logged in."));
}else{
dfd.errback(new Error("Key Service error: ioArgs.xhr.status = "+_19e0.xhr.status));
}
}
return _19df;
}});
return dfd;
};
}
if(!dojo._hasResource["pion.widgets.Wizard"]){
dojo._hasResource["pion.widgets.Wizard"]=true;
dojo.provide("pion.widgets.Wizard");
dojo.declare("pion.widgets.Wizard",[dojox.widget.Wizard],{widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
},placeholder:function(){
}});
pion.widgets.Wizard.exitEarly=function(){
pion.wizardDone(true);
};
pion.widgets.Wizard.prepareLicensePane=function(){
dijit.byId("license_accept_checkbox").attr("checked",false);
if(pion.edition=="Core"){
dojo.byId("atomic_enterprise_license").style.display="none";
dojo.byId("gpl_affero_license").style.display="block";
}else{
dojo.byId("atomic_enterprise_license").style.display="block";
dojo.byId("gpl_affero_license").style.display="none";
}
return true;
};
pion.widgets.Wizard.checkLicenseAccepted=function(){
if(dijit.byId("license_accept_checkbox").attr("checked")){
if(pion.edition=="Core"){
pion.widgets.Wizard.exitEarly();
}
return true;
}else{
return pion.wizard_nlsStrings.license_checkbox_not_checked_message;
}
};
pion.widgets.Wizard.getArrayFromCSVString=function(_19e1){
var _19e2=_19e1.split(",");
var _19e3=dojo.map(_19e2,function(item){
return dojo.trim(item);
});
return dojo.filter(_19e3,function(item){
return item!="";
});
};
pion.widgets.Wizard.checkHosts=function(){
var _19e6=dijit.byId("host_suffixes").attr("value").split(",");
var _19e7=dojo.map(_19e6,function(item){
return dojo.trim(item);
});
pion.wizard.host_suffixes=dojo.filter(_19e7,function(item){
return item!="";
});
if(pion.wizard.host_suffixes.length==0){
dijit.byId("wizard").selectChild(dijit.byId("analytics_provider_pane"));
return false;
}else{
return true;
}
};
pion.widgets.Wizard.checkCookies=function(){
var _19ea=dijit.byId("cookie_1").attr("value");
var _19eb=dijit.byId("is_visitor_cookie").attr("checked");
pion.wizard.cookies=[{name:_19ea,is_visitor_cookie:_19eb}];
return true;
};
pion.widgets.Wizard.checkAnalyticsProvider=function(){
pion.wizard.analytics_provider=dijit.byId("select_analytics_provider_form").attr("value").analytics_provider;
switch(pion.wizard.analytics_provider){
case "Omniture":
pion.wizard.selectChild(dijit.byId("omniture_pane"));
pion.wizard.analytics_provider_label=pion.wizard_nlsStrings.omniture_label;
break;
case "Webtrends":
pion.wizard.selectChild(dijit.byId("webtrends_pane"));
pion.wizard.analytics_provider_label=pion.wizard_nlsStrings.webtrends_label;
break;
case "Google":
pion.wizard.selectChild(dijit.byId("google_pane"));
pion.wizard.analytics_provider_label=pion.wizard_nlsStrings.google_label;
break;
case "Unica":
pion.wizard.selectChild(dijit.byId("unica_pane"));
pion.wizard.analytics_provider_label=pion.wizard_nlsStrings.unica_label;
break;
default:
pion.wizard.selectChild(dijit.byId("capture_devices_pane"));
pion.wizard.analytics_provider_label="None";
break;
}
return false;
};
pion.widgets.Wizard.checkOmnitureConfig=function(){
pion.wizard.omniture_host=dojo.trim(dijit.byId("omniture_host").attr("value"));
pion.wizard.omniture_report_suite=dojo.trim(dijit.byId("omniture_report_suite").attr("value"));
if("OK"){
pion.wizard.selectChild(dijit.byId("capture_devices_pane"));
}
return false;
};
pion.widgets.Wizard.checkWebtrendsConfig=function(){
if("OK"){
pion.wizard.selectChild(dijit.byId("capture_devices_pane"));
}
return false;
};
pion.widgets.Wizard.checkGoogleConfig=function(){
pion.wizard.google_account_id=dijit.byId("google_account_id").attr("value");
if("OK"){
pion.wizard.selectChild(dijit.byId("capture_devices_pane"));
}
return false;
};
pion.widgets.Wizard.checkUnicaConfig=function(){
if("OK"){
pion.wizard.selectChild(dijit.byId("capture_devices_pane"));
}
return false;
};
pion.widgets.Wizard.checkCaptureDevices=function(){
pion.wizard.devices=dijit.byId("device_list").attr("value").device_check_boxes;
return true;
};
pion.widgets.Wizard.checkPorts=function(){
var _19ec=dijit.byId("port_list").attr("value");
pion.wizard.unencrypted_ports=pion.widgets.Wizard.getArrayFromCSVString(_19ec.unencrypted_ports);
pion.wizard.encrypted_ports=pion.widgets.Wizard.getArrayFromCSVString(_19ec.encrypted_ports);
pion.wizard.ports=pion.wizard.unencrypted_ports.concat(pion.wizard.encrypted_ports);
if(pion.wizard.encrypted_ports.length==0){
if(pion.edition=="Replay"){
pion.wizard.selectChild(dijit.byId("setup_replay"));
}else{
pion.widgets.Wizard.prepareSetupReview();
pion.wizard.selectChild(dijit.byId("review_setup"));
}
return false;
}
return true;
};
pion.widgets.Wizard.saveKey=function(){
var _19ed=dijit.byId("ssl_key_setup").attr("value");
var _19ee=dojo.byId("ssl_key_input");
var _19ef="<PionConfig><Key>";
_19ef+=pion.makeXmlLeafElement("Name",_19ed.name);
_19ef+=pion.makeXmlLeafElement("PEM",_19ee.value);
_19ef+="</Key></PionConfig>";
dijit.byId("ssl_key_setup").attr("value",{name:""});
_19ee.value="";
dojo.rawXhrPost({url:"/keystore",contentType:"text/xml",handleAs:"xml",postData:_19ef,load:function(_19f0){
return _19f0;
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_19ef})});
};
pion.widgets.Wizard.checkSSLKeys=function(){
if(pion.edition=="Replay"){
return true;
}else{
pion.widgets.Wizard.prepareSetupReview();
pion.wizard.selectChild(dijit.byId("review_setup"));
return false;
}
};
pion.widgets.Wizard.checkReplaySetup=function(){
var _19f1=dijit.byId("replay_setup").attr("value");
pion.wizard.max_disk_usage=_19f1.max_disk_usage;
pion.widgets.Wizard.prepareSetupReview();
};
pion.widgets.Wizard.prepareSetupReview=function(){
dojo.byId("setup_review_form_edition").innerHTML="Pion "+pion.edition;
dojo.byId("setup_review_form_web_site").innerHTML=pion.wizard.host_suffixes.join(", ");
dojo.byId("setup_review_form_web_analytics").innerHTML=pion.wizard.analytics_provider_label;
dojo.byId("setup_review_form_cookies").innerHTML=dojo.map(pion.wizard.cookies,function(item){
return item.name;
}).join(", ");
dojo.byId("setup_review_form_devices").innerHTML=pion.wizard.devices.join(", ");
dojo.byId("setup_review_form_ports").innerHTML=pion.wizard.ports.join(", ");
dojo.byId("setup_review_form_ssl_keys").innerHTML="this is a placeholder";
dojo.byId("setup_review_form_replay_alloc").innerHTML=pion.wizard.max_disk_usage;
};
pion.widgets.Wizard.wizardDone=function(){
};
}
if(!dojo._hasResource["pion.widgets.LicenseKey"]){
dojo._hasResource["pion.widgets.LicenseKey"]=true;
dojo.provide("pion.widgets.LicenseKey");
dojo.declare("pion.widgets.LicenseKeyDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog license_key_dialog\" style=\"width: 600px\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">${title}</span>\r\n\t</div>\r\n\t<form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\">\r\n\t\t<div class=\"dijitDialogPaneContent\">\r\n\t\t\t<textarea dojoAttachPoint=\"license_key_text_area\" style=\"width: 100%\" rows=\"8\" dojoAttachEvent=\"oninput: enableSubmit, onkeydown: enableSubmit\"></textarea>\r\n\t\t</div>\r\n\t\t<p><big><strong>\r\n\t\t\t<span id=\"result_of_submitting_key_2\" dojoAttachPoint=\"result_of_submitting_key_2\"></span>\r\n\t\t</strong></big></p>\r\n\t\t<div dojoAttachPoint=\"license_section\">\r\n\t\t\t<div dojoType=\"dijit.layout.ContentPane\" style=\"width:400px; border:1px solid #b7b7b7; background:#fff; padding:8px; margin:0 auto; height:200px; overflow:auto; \"\r\n\t\t\t\thref=\"licenses/atomic_enterprise.html\">\r\n\t\t\t</div>\r\n\t\t\t<p>\r\n\t\t\t\t<input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"checkboxes\" value=\"accept\" /> I agree to the license.\r\n\t\t\t</p>\r\n\t\t</div>\r\n\t</form>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: submitKey\"\r\n\t\t\t\tdojoAttachPoint=\"apply_button\" disabled=\"true\">Submit</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: onCancel\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",widgetsInTemplate:true,postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},postCreate:function(){
this.inherited("postCreate",arguments);
var _this=this;
dojo.connect(this,"onCancel",function(){
if(_this.callback){
_this.callback(false);
}
});
if(this.include_license==false){
dojo.addClass(this.license_section,"hidden");
}
},include_license:true,enableSubmit:function(){
this.apply_button.attr("disabled",false);
},submitKey:function(){
if(this.include_license){
var _19f4=this.form.attr("value");
if(dojo.indexOf(_19f4.checkboxes,"accept")==-1){
this.result_of_submitting_key_2.innerHTML="You must agree to the license before submitting the key.";
return false;
}
}
var key=this.license_key_text_area.value;
var _this=this;
dojo.rawXhrPut({url:"/key",contentType:"text/plain",handleAs:"xml",putData:key,load:function(_19f7){
pion.key_service_running=true;
if(_this.requested_product){
var _19f8=dojo.map(_19f7.getElementsByTagName("Product"),function(p){
return dojox.xml.parser.textContent(p);
});
if(dojo.indexOf(_19f8,_this.requested_product)==-1){
_this.result_of_submitting_key_2.innerHTML="Error: Key not valid for "+_this.requested_product+".";
return _19f7;
}
}
if(_this.callback){
_this.callback(true);
}
_this.hide();
return _19f7;
},error:function(_19fa,_19fb){
_this.result_of_submitting_key_2.innerHTML="Error: Key not accepted.";
return _19fa;
}});
}});
}
if(!dojo._hasResource["pion.widgets.EditionSelector"]){
dojo._hasResource["pion.widgets.EditionSelector"]=true;
dojo.provide("pion.widgets.EditionSelector");
dojo.declare("pion.widgets.EditionSelectorForm",[dijit.form.Form],{templateString:"<div dojoAttachPoint='containerNode'>\r\n\t<form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\">\r\n\t\t<input type=\"radio\" name=\"edition\" value=\"Core\" dojoType=\"dijit.form.RadioButton\" dojoAttachEvent=\"onClick: coreEditionSelected\" /><label>Pion Core</label>\r\n\t\t${pion_core_description}\r\n\t\t<input type=\"radio\" name=\"edition\" value=\"Lite\" dojoType=\"dijit.form.RadioButton\" dojoAttachEvent=\"onClick: liteEditionSelected\" /><label>Pion Lite</label>\r\n\t\t${pion_lite_description}\r\n\t\t<input type=\"radio\" name=\"edition\" value=\"Enterprise\" dojoType=\"dijit.form.RadioButton\" dojoAttachEvent=\"onClick: enterpriseEditionSelected\" /><label>Pion Enterprise</label>\r\n\t\t${pion_enterprise_description}\r\n\t\t<input type=\"radio\" name=\"edition\" value=\"Replay\" dojoType=\"dijit.form.RadioButton\" dojoAttachEvent=\"onClick: replayEditionSelected\" /><label>Pion Replay</label>\r\n\t\t${pion_replay_description}\r\n\t</form>\r\n</div>\r\n",widgetsInTemplate:true,postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
var _19fc=dojo.i18n.getLocalization("pion","wizard");
dojo.mixin(this,_19fc);
},postCreate:function(){
this.inherited("postCreate",arguments);
dojo.connect(this,"hide",this,"destroyRecursive");
this.attr("value",{edition:""});
},coreEditionSelected:function(){
},liteEditionSelected:function(){
},replayEditionSelected:function(){
if(!pion.key_service_running){
alert(pion.wizard_nlsStrings.edition_disabled_because_key_service_not_running);
var form=dijit.byId("select_edition_form");
form.attr("value",{edition:""});
return;
}
pion.about.checkKeyStatusDfd().addBoth(function(_19fe){
if(_19fe!="replay"){
var title="Please enter your Pion Replay license key";
var _1a00=new pion.widgets.LicenseKeyDialog({title:title,requested_product:"Pion Replay",include_license:false});
_1a00.show();
}
});
},enterpriseEditionSelected:function(){
if(!pion.key_service_running){
alert(pion.wizard_nlsStrings.edition_disabled_because_key_service_not_running);
var form=dijit.byId("select_edition_form");
form.attr("value",{edition:""});
return;
}
pion.about.checkKeyStatusDfd().addBoth(function(_1a02){
if(_1a02!="replay"&&_1a02!="enterprise"){
var title="Please enter your Pion Enterprise license key";
var _1a04=new pion.widgets.LicenseKeyDialog({title:title,requested_product:"Pion Enterprise",include_license:false});
_1a04.show();
}
});
}});
dojo.declare("pion.widgets.EditionSelectorDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog edition_selector_dialog\" style=\"width: 600px\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Please Select an Edition</span>\r\n\t</div>\r\n\t<div dojoAttachPoint='containerNode'>\r\n\t\t<form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\">\r\n\t\t\t<input type=\"radio\" name=\"edition\" value=\"Core\" dojoType=\"dijit.form.RadioButton\" dojoAttachEvent=\"onClick: coreEditionSelected\" /><label>Pion Core</label>\r\n\t\t\t${pion_core_description}\r\n\t\t\t<input type=\"radio\" name=\"edition\" value=\"Lite\" dojoType=\"dijit.form.RadioButton\" dojoAttachEvent=\"onClick: liteEditionSelected\" /><label>Pion Lite</label>\r\n\t\t\t${pion_lite_description}\r\n\t\t\t<input type=\"radio\" name=\"edition\" value=\"Enterprise\" dojoType=\"dijit.form.RadioButton\" dojoAttachEvent=\"onClick: enterpriseEditionSelected\" /><label>Pion Enterprise</label>\r\n\t\t\t${pion_enterprise_description}\r\n\t\t\t<input type=\"radio\" name=\"edition\" value=\"Replay\" dojoType=\"dijit.form.RadioButton\" dojoAttachEvent=\"onClick: replayEditionSelected\" /><label>Pion Replay</label>\r\n\t\t\t${pion_replay_description}\r\n\t\t</form>\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\" dojoAttachPoint=\"submit_edition_button\" disabled=\"true\">Submit</button>\r\n\t</div>\r\n</div>\r\n",widgetsInTemplate:true,postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
var _1a05=dojo.i18n.getLocalization("pion","wizard");
dojo.mixin(this,_1a05);
},postCreate:function(){
this.inherited("postCreate",arguments);
var _this=this;
},coreEditionSelected:function(){
this.enableSubmit();
},liteEditionSelected:function(){
this.enableSubmit();
},enterpriseEditionSelected:function(){
if(!pion.key_service_running){
alert(pion.wizard_nlsStrings.edition_disabled_because_key_service_not_running);
this.form.attr("value",{edition:""});
this.submit_edition_button.attr("disabled",true);
return;
}
var title="Please enter your Pion Enterprise license key";
var _1a08=new pion.widgets.LicenseKeyDialog({title:title,requested_product:"Pion Enterprise"});
_1a08.show();
var _this=this;
_1a08.callback=function(_1a0a){
if(_1a0a){
_this.enableSubmit();
}else{
_this.form.attr("value",{edition:""});
_this.submit_edition_button.attr("disabled",true);
}
};
},replayEditionSelected:function(){
if(!pion.key_service_running){
alert(pion.wizard_nlsStrings.edition_disabled_because_key_service_not_running);
this.form.attr("value",{edition:""});
this.submit_edition_button.attr("disabled",true);
return;
}
var title="Please enter your Pion Replay license key";
var _1a0c=new pion.widgets.LicenseKeyDialog({title:title,requested_product:"Pion Replay"});
_1a0c.show();
var _this=this;
_1a0c.callback=function(_1a0e){
if(_1a0e){
_this.enableSubmit();
}else{
_this.form.attr("value",{edition:""});
_this.submit_edition_button.attr("disabled",true);
}
};
},enableSubmit:function(){
this.submit_edition_button.attr("disabled",false);
},execute:function(_1a0f){
pion.edition=_1a0f.edition;
dojo.cookie("pion_edition",pion.edition);
dojo.byId("wizard").style.display="none";
dojo.byId("outer").style.visibility="visible";
dojo.byId("current_user_menu_section").style.visibility="visible";
dojo.byId("current_user").innerHTML=dojo.cookie("user");
pion.terms.init();
pion.services.init();
}});
}
dojo.registerModulePath("pion","/scripts");
dojo.registerModulePath("plugins","/plugins");
var reactor_config_page_initialized=false;
var vocab_config_page_initialized=false;
var codec_config_page_initialized=false;
var database_config_page_initialized=false;
var protocol_config_page_initialized=false;
var user_config_page_initialized=false;
var system_config_page_initialized=false;
var file_protocol=false;
var firefox_on_mac;
pion.doDeleteConfirmationDialog=function(_1a10,_1a11,_1a12){
var _1a13=pion.delete_confirmation_dialog;
if(!_1a13){
_1a13=new dijit.Dialog({title:"Delete Confirmation",content:"<div id=\"are_you_sure\"></div>"+"<button id=\"cancel_delete\" dojoType=\"dijit.form.Button\" class=\"cancel\">Cancel</button>"+"<button id=\"confirm_delete\" dojoType=dijit.form.Button class=\"delete\">Delete</button>"});
dojo.byId("cancel_delete").onclick=function(){
_1a13.onCancel();
};
pion.delete_confirmation_dialog=_1a13;
}
dojo.byId("are_you_sure").innerHTML=_1a10;
dojo.byId("confirm_delete").onclick=function(){
_1a13.onCancel();
_1a11(_1a12);
};
_1a13.show();
setTimeout("dijit.byId('cancel_delete').focus()",500);
};
pion.initOptionalValue=function(store,item,_1a16,_1a17,_1a18){
if(store.hasAttribute(item,_1a17)){
_1a16[_1a17]=store.getValue(item,_1a17);
}else{
if(_1a18!==undefined){
_1a16[_1a17]=_1a18;
}
}
};
pion.resources_by_tab_id={reactor_config:"/config/reactors",vocab_config:"/config/vocabularies",codec_config:"/config/codecs",database_config:"/config/databases",protocol_config:"/config/protocols",user_config:"/config/users",system_config:"/config"};
pion.initTabs=function(){
dojo.xhrGet({url:"/config/users/"+dojo.cookie("user"),preventCache:true,handleAs:"xml",timeout:5000,load:function(_1a19,_1a1a){
var _1a1b=dijit.byId("main_stack_container");
var _1a1c=dojo.map(_1a19.getElementsByTagName("Permit"),function(_1a1d){
return dojo.isIE?_1a1d.childNodes[0].nodeValue:_1a1d.textContent;
});
for(var _1a1e in pion.resources_by_tab_id){
if(dojo.indexOf(_1a1c,pion.resources_by_tab_id[_1a1e])==-1){
_1a1b.removeChild(dijit.byId(_1a1e));
}
}
var tabs=_1a1b.getChildren();
if(tabs.length>0){
_1a1b.selectChild(tabs[0]);
configPageSelected(tabs[0]);
}else{
alert("There are no access rights defined for this user account.  You may need to reset your users.xml file.");
}
dojo.subscribe("main_stack_container-selectChild",configPageSelected);
return _1a19;
}});
pion.tab_ids_by_resource={};
for(var _1a20 in pion.resources_by_tab_id){
pion.tab_ids_by_resource[pion.resources_by_tab_id[_1a20]]=_1a20;
}
};
pion.applyTemplatesIfNeeded=function(_1a21){
var dfd=new dojo.Deferred();
if(pion.edition!="Replay"){
dfd.callback(_1a21);
return dfd;
}
var _1a23=dojo.map(_1a21.reactors,function(item){
return item.label;
});
var _1a25=dojo.indexOf(_1a23,"mdr");
dojo.xhrGet({url:"/resources/MDRTemplate.tmpl",handleAs:"text",timeout:20000,load:function(_1a26,_1a27){
_1a21.reactors[_1a25].config+=dojo.string.substitute(_1a26,{MaxDiskUsage:pion.wizard.max_disk_usage});
dfd.callback(_1a21);
return _1a26;
},error:pion.handleXhrGetError});
return dfd;
};
pion.addReactorsFromWizard=function(_1a28){
var dfd=new dojo.Deferred();
if(_1a28.reactors.length==0){
dfd.callback(_1a28);
return dfd;
}
var _1a2a=0;
var _this=this;
_1a28.reactor_ids={};
var _1a2c="<PionConfig><Reactor><Workspace>"+_1a28.workspace_name+"</Workspace>";
dojo.forEach(_1a28.reactors,function(_1a2d){
var _1a2e=_1a2c+_1a2d.config+"</Reactor></PionConfig>";
dojo.rawXhrPost({url:"/config/reactors",contentType:"text/xml",handleAs:"xml",postData:_1a2e,load:function(_1a2f){
var node=_1a2f.getElementsByTagName("Reactor")[0];
_1a28.reactor_ids[_1a2d.label]=node.getAttribute("id");
if(++_1a2a==_1a28.reactors.length){
dfd.callback(_1a28);
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1a2e})});
});
return dfd;
};
pion.addConnectionsFromWizard=function(_1a31){
var dfd=new dojo.Deferred();
if(_1a31.connections.length==0){
dfd.callback(_1a31);
}
var _1a33=0;
var _this=this;
dojo.forEach(_1a31.connections,function(_1a35){
var _1a36="<PionConfig><Connection><Type>reactor</Type>"+"<From>"+_1a31.reactor_ids[_1a35.from]+"</From>"+"<To>"+_1a31.reactor_ids[_1a35.to]+"</To>"+"</Connection></PionConfig>";
dojo.rawXhrPost({url:"/config/connections",contentType:"text/xml",handleAs:"xml",postData:_1a36,load:function(_1a37){
if(++_1a33==_1a31.connections.length){
dfd.callback(_1a31);
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1a36})});
});
return dfd;
};
pion.addReplayIfNeeded=function(_1a38){
var dfd=new dojo.Deferred();
if(pion.edition!="Replay"){
dfd.callback(_1a38);
return dfd;
}
var _1a3a="<Name>Replay Query Service</Name>"+"<Comment>Pion Replay query service</Comment>"+"<Plugin>ReplayService</Plugin>"+"<Resource>/replay</Resource>"+"<Server>main-server</Server>"+"<Namespace id=\"0\">"+"<Comment>Default Instance</Comment>"+"<MultiDatabaseOutputReactor>"+_1a38.reactor_ids["mdr"]+"</MultiDatabaseOutputReactor>"+"</Namespace>";
var _1a3b="<PionConfig><PlatformService>"+_1a3a+"</PlatformService></PionConfig>";
dojo.rawXhrPost({url:"/config/services",contentType:"text/xml",handleAs:"xml",postData:_1a3b,load:function(_1a3c){
var node=_1a3c.getElementsByTagName("PlatformService")[0];
dfd.callback(_1a38);
return _1a3c;
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1a3b})});
return dfd;
};
pion.wizardDone=function(_1a3e){
dojo.addClass("wizard","hidden");
dojo.byId("outer").style.visibility="visible";
dojo.byId("current_user_menu_section").style.visibility="visible";
dojo.byId("current_user").innerHTML=dojo.cookie("user");
if(_1a3e){
pion.setup_success_callback();
return;
}
var _1a3f="<Plugin>SnifferReactor</Plugin>"+"<X>50</X>"+"<Y>100</Y>"+"<Name>Capture Traffic</Name>"+"<Comment>Captures raw network traffic to generate HTTP request events</Comment>"+"<Protocol>"+pion.protocols.default_id+"</Protocol>"+"<ProcessingThreads>3</ProcessingThreads>"+"<MaxPacketQueueSize>100000</MaxPacketQueueSize>"+"<QueueEventDelivery>true</QueueEventDelivery>";
dojo.forEach(pion.wizard.devices,function(_1a40){
var _1a41=dojo.map(pion.wizard.ports,function(item){
return "tcp port "+item;
});
_1a3f+="<Capture><Interface>"+_1a40+"</Interface><Filter>";
_1a3f+=_1a41.join(" or ");
_1a3f+="</Filter></Capture>";
});
var _1a43="<Plugin>ClickstreamReactor</Plugin>"+"<X>250</X>"+"<Y>200</Y>"+"<Name>Sessionize Traffic</Name>"+"<Comment>Sessionizes HTTP traffic into page views and visitor sessions</Comment>"+"<SessionTimeout>1800</SessionTimeout>"+"<PageTimeout>10</PageTimeout>"+"<MaxOpenPages>5</MaxOpenPages>"+"<MaxOpenEvents>100</MaxOpenEvents>"+"<IgnoreRobotTraffic>true</IgnoreRobotTraffic>"+"<UseEventTimeForTimeouts>false</UseEventTimeForTimeouts>"+"<AnonPersistence>false</AnonPersistence>"+"<CookiePersistence>true</CookiePersistence>"+"<SessionGroup id=\"default\">"+"<Name>Default Group</Name>"+"<Cookie type=\"s\">__utma</Cookie>"+"<Cookie type=\"v\">__utmz</Cookie>"+"<Cookie type=\"v\">s_vi</Cookie>"+"</SessionGroup>";
if(pion.wizard.host_suffixes.length>0){
var _1a44=pion.wizard.host_suffixes[0].split(".");
var _1a45=_1a44.length;
var _1a46=_1a44[_1a45==1?0:_1a45-2];
_1a43+="<SessionGroup id=\""+_1a46+"\">"+"<Name>"+_1a46+"</Name>";
dojo.forEach(pion.wizard.host_suffixes,function(host){
_1a43+="<Host>"+dojo.trim(host)+"</Host>";
});
dojo.forEach(pion.wizard.cookies,function(_1a48){
_1a43+="<Cookie type=\""+(_1a48.is_visitor_cookie?"v":"s")+"\">"+_1a48.name+"</Cookie>";
});
_1a43+="</SessionGroup>";
}
_1a43+="<PageObjects>"+"<MatchAllComparisons>false</MatchAllComparisons>"+"<Comparison>"+"<Term>urn:vocab:clickstream#uri-stem</Term>"+"<Type>regex</Type>"+"<Value>.(gif|jpg|jpeg|png|ico|css|js|swf)$</Value>"+"<MatchAllValues>false</MatchAllValues>"+"</Comparison>"+"<Comparison>"+"<Term>urn:vocab:clickstream#content-type</Term>"+"<Type>regex</Type>"+"<Value>(image/|application/|text/css|text/plain|javascript|xml|json)</Value>"+"<MatchAllValues>false</MatchAllValues>"+"</Comparison>"+"</PageObjects>";
if(pion.wizard.analytics_provider=="Omniture"){
var _1a49="<Plugin>OmnitureAnalyticsReactor</Plugin>"+"<X>250</X>"+"<Y>300</Y>"+"<Name>Omniture Analytics</Name>"+"<NumConnections>32</NumConnections>"+"<HttpHost>"+pion.wizard.omniture_host+"</HttpHost>"+"<AccountId>"+pion.wizard.omniture_report_suite+"</AccountId>"+"<EncryptConnections>false</EncryptConnections>"+"<SendTimestamp>true</SendTimestamp>"+"<Query name=\"ipaddress\">urn:vocab:clickstream#c-ip</Query>"+"<Query name=\"userAgent\">urn:vocab:clickstream#useragent</Query>"+"<Query name=\"pageName\">urn:vocab:clickstream#page-title</Query>"+"<Query name=\"referrer\">urn:vocab:clickstream#referer</Query>"+"<Query name=\"visitorID\">[computed]</Query>"+"<Query name=\"server\">[computed]</Query>"+"<Query name=\"pageURL\">[computed]</Query>"+"<Query name=\"timestamp\">[computed]</Query>"+"<Query name=\"reportSuiteID\">[computed]</Query>";
}else{
if(pion.wizard.analytics_provider=="Webtrends"){
var _1a49="<Plugin>WebTrendsAnalyticsReactor</Plugin>"+"<X>250</X>"+"<Y>300</Y>"+"<Name>WebTrends Analytics</Name>"+"<AccountId>"+pion.wizard.webtrends_account_id+"</AccountId>"+"<NumConnections>32</NumConnections>"+"<EncryptConnections>false</EncryptConnections>";
}else{
if(pion.wizard.analytics_provider=="Google"){
var _1a49="<Plugin>GoogleAnalyticsReactor</Plugin>"+"<X>250</X>"+"<Y>300</Y>"+"<Name>Google Analytics</Name>"+"<AccountId>"+pion.wizard.google_account_id+"</AccountId>"+"<NumConnections>32</NumConnections>"+"<EncryptConnections>false</EncryptConnections>";
}else{
if(pion.wizard.analytics_provider=="Unica"){
var _1a49="<Plugin>UnicaAnalyticsReactor</Plugin>"+"<X>250</X>"+"<Y>300</Y>"+"<Name>Unica OnDemand</Name>"+"<AccountId>"+pion.wizard.unica_account_id+"</AccountId>"+"<NumConnections>32</NumConnections>"+"<EncryptConnections>false</EncryptConnections>";
}else{
}
}
}
}
if(pion.edition=="Replay"){
var _1a4a="<Plugin>ContentHashReactor</Plugin>"+"<X>250</X>"+"<Y>100</Y>"+"<Name>Detect Page Content</Name>"+"<SourceTerm>urn:vocab:clickstream#sc-content</SourceTerm>"+"<MatchAllComparisons>true</MatchAllComparisons>"+"<Comment>Looks for page content in HTTP events that will be stored for Replay</Comment>"+"<Comparison>"+"<Term>urn:vocab:clickstream#status</Term>"+"<Type>equals</Type>"+"<Value>200</Value>"+"<MatchAllValues>false</MatchAllValues>"+"</Comparison>"+"<Comparison>"+"<Term>urn:vocab:clickstream#content-type</Term>"+"<Type>starts-with</Type>"+"<Value>text/html</Value>"+"<MatchAllValues>false</MatchAllValues>"+"</Comparison>";
var _1a4b="<X>450</X>"+"<Y>200</Y>";
var _1a4c=[{label:"sniffer",config:_1a3f},{label:"chr",config:_1a4a},{label:"clickstream",config:_1a43},{label:"mdr",config:_1a4b}];
var _1a4d=[{from:"sniffer",to:"chr"},{from:"chr",to:"clickstream"},{from:"clickstream",to:"mdr"}];
}else{
var _1a4c=[{label:"sniffer",config:_1a3f},{label:"clickstream",config:_1a43}];
var _1a4d=[{from:"sniffer",to:"clickstream"}];
}
if(_1a49){
_1a4c.push({label:"analytics",config:_1a49});
_1a4d.push({from:"clickstream",to:"analytics"});
}
wizard_config={reactors:_1a4c,connections:_1a4d,workspace_name:"Clickstream"};
if(pion.wizard.host_suffixes.length>0){
var _1a44=pion.wizard.host_suffixes[0].split(".");
var _1a45=_1a44.length;
var _1a4e=_1a44[_1a45==1?0:_1a45-2];
wizard_config.workspace_name=dojox.dtl.filter.strings.capfirst(_1a4e)+" Clickstream";
}
pion.applyTemplatesIfNeeded(wizard_config).addCallback(pion.addReactorsFromWizard).addCallback(pion.addConnectionsFromWizard).addCallback(pion.addReplayIfNeeded).addCallback(pion.setup_success_callback);
};
pion.checkEdition=function(){
var form=dijit.byId("select_edition_form");
pion.edition=form.attr("value").edition;
if(pion.edition){
dojo.cookie("pion_edition",pion.edition);
pion.widgets.Wizard.prepareLicensePane();
return true;
}else{
return "Please select an edition.";
}
};
pion.setup_success_callback=function(){
pion.terms.init();
pion.services.init();
};
pion.editionSetup=function(_1a50){
pion.wizard=dijit.byId("wizard");
pion.wizard.back=function(){
if(pion.wizard.selectedChildWidget.returnPane){
pion.wizard.selectChild(dijit.byId(pion.wizard.selectedChildWidget.returnPane));
}else{
this.selectChild(this._adjacent(false));
}
};
pion.wizard_nlsStrings=dojo.i18n.getLocalization("pion","wizard");
dojo.xhrGet({url:"/config/reactors",preventCache:true,handleAs:"xml",timeout:5000,load:function(_1a51,_1a52){
dojo.cookie("logged_in","true",{expires:1});
var _1a53=_1a51.getElementsByTagName("Reactor");
if(_1a53.length){
if(_1a50=="enterprise"||_1a50=="replay"){
dojo.byId("wizard").style.display="none";
dojo.byId("outer").style.visibility="visible";
dojo.byId("current_user_menu_section").style.visibility="visible";
dojo.byId("current_user").innerHTML=dojo.cookie("user");
pion.setup_success_callback();
}else{
if(dojo.cookie("pion_edition")){
pion.edition=dojo.cookie("pion_edition");
}
if(pion.edition=="Core"||pion.edition=="Lite"){
dojo.byId("wizard").style.display="none";
dojo.byId("outer").style.visibility="visible";
dojo.byId("current_user_menu_section").style.visibility="visible";
dojo.byId("current_user").innerHTML=dojo.cookie("user");
pion.setup_success_callback();
}else{
var _1a54=new pion.widgets.EditionSelectorDialog;
_1a54.show();
}
}
}else{
var _1a55=dijit.byId("wizard");
dojo.removeClass("wizard","hidden");
pion.wizard.cookies=[];
pion.wizard.devices=[];
pion.wizard.max_disk_usage="NA";
pion.services.config_store.fetch({onItem:function(item){
var _1a57=pion.services.config_store.getValue(item,"Plugin");
if(_1a57=="ReplayService"){
var id=pion.services.config_store.getValue(item,"@id");
dojo.xhrDelete({url:"/config/services/"+id,handleAs:"xml",timeout:5000,load:function(_1a59,_1a5a){
return _1a59;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
}
},onError:pion.handleFetchError});
dojo.forEach(dojo.query("label",dojo.byId("select_analytics_provider_form")),function(node){
node.innerHTML=dojo.string.substitute(node.innerHTML,{omniture_label:pion.wizard_nlsStrings.omniture_label,webtrends_label:pion.wizard_nlsStrings.webtrends_label,google_label:pion.wizard_nlsStrings.google_label,unica_label:pion.wizard_nlsStrings.unica_label});
});
if(dojo.cookie("pion_edition")){
pion.edition=dojo.cookie("pion_edition");
dijit.byId("select_edition_form").attr("value",{edition:pion.edition});
}else{
if(_1a50=="enterprise"){
dijit.byId("select_edition_form").attr("value",{edition:"Enterprise"});
}else{
if(_1a50=="replay"){
dijit.byId("select_edition_form").attr("value",{edition:"Replay"});
}
}
}
var _1a5c=_1a55.selectedChildWidget;
dojo.forEach(dojo.query(".next_button",_1a5c.domNode),function(node){
_1a55.nextButton.attr("label",node.innerHTML);
});
dojo.subscribe("wizard-selectChild",function(page){
dojo.forEach(dojo.query(".prev_button",page.domNode),function(node){
_1a55.previousButton.attr("label",node.innerHTML);
if(node.getAttribute("returnPane")){
page.returnPane=node.getAttribute("returnPane");
}
});
dojo.forEach(dojo.query(".next_button",page.domNode),function(node){
_1a55.nextButton.attr("label",node.innerHTML);
});
var _1a61=".next_button_"+pion.edition.toLowerCase();
dojo.forEach(dojo.query(_1a61,page.domNode),function(node){
_1a55.nextButton.attr("label",node.innerHTML);
});
dojo.forEach(dojo.query(".done_button",page.domNode),function(node){
_1a55.doneButton.attr("label",node.innerHTML);
});
if(page.id=="capture_devices_pane"){
if(!page.device_list_initialized){
var _1a64="<PionConfig><Reactor>"+"<Plugin>SnifferReactor</Plugin>"+"<Protocol>"+pion.protocols.default_id+"</Protocol>"+"</Reactor></PionConfig>";
dojo.rawXhrPost({url:"/config/reactors",contentType:"text/xml",handleAs:"xml",postData:_1a64,load:function(_1a65){
var node=_1a65.getElementsByTagName("Reactor")[0];
var id=node.getAttribute("id");
var _1a68=new dojox.data.XmlStore({url:"/query/reactors/"+id+"/interfaces"});
var _1a69=dojo.byId("device_list");
_1a68.fetch({query:{tagName:"Interface"},onItem:function(item){
var _1a6b=_1a68.getValue(item,"Name");
var _1a6c=_1a68.getValue(item,"Description");
var _1a6d=document.createElement("div");
_1a69.appendChild(_1a6d);
new dijit.form.CheckBox({name:"device_check_boxes",value:_1a6b},_1a6d);
var _1a6e=dojo.create("span",{innerHTML:_1a6c});
_1a69.appendChild(_1a6e);
_1a69.appendChild(dojo.create("br"));
var _1a6f=dojo.create("label",{innerHTML:_1a6b});
_1a69.appendChild(_1a6f);
_1a69.appendChild(dojo.create("br"));
},onComplete:function(){
dojo.xhrDelete({url:"/config/reactors/"+id,handleAs:"xml",timeout:5000,load:function(_1a70,_1a71){
return _1a70;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
page.device_list_initialized=true;
}});
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1a64})});
}
}
});
}
},error:function(_1a72,_1a73){
pion.handleXhrGetError();
}});
};
pion.checkKeyService=function(){
pion.about.checkKeyStatusDfd().addCallback(function(_1a74){
pion.editionSetup(_1a74);
}).addErrback(function(e){
if(e.message=="Not logged in."){
if(!dojo.cookie("logged_in")){
location.replace("login.html");
}
pion.login.doLoginDialog({suppress_default_key_status_check:true,success_callback:pion.checkKeyService});
}else{
pion.handleXhrGetError();
}
});
};
var init=function(){
file_protocol=(window.location.protocol=="file:");
firefox_on_mac=navigator.userAgent.indexOf("Mac")>=0&&navigator.userAgent.indexOf("Firefox")>=0;
pion.checkKeyService();
};
dojo.addOnLoad(init);
function configPageSelected(page){
console.debug("Selected "+page.title+" configuration page");
pion.current_page=page.title;
if(page.title=="Reactors"){
if(reactor_config_page_initialized){
pion.reactors.reselectCurrentWorkspace();
dijit.byId("main_stack_container").resize({h:pion.reactors.getHeight()});
}else{
pion.reactors.init();
reactor_config_page_initialized=true;
}
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
dijit.form.TextBox.prototype._setValueAttr=function(value,_1a78,_1a79){
var _1a7a;
if(value!==undefined){
_1a7a=this.filter(value);
if(_1a7a!==null&&((typeof _1a7a!="number")||!isNaN(_1a7a))){
if(_1a79===undefined||!_1a79.toString){
_1a79=this.format(_1a7a,this.constraints);
}
}else{
_1a79="";
}
}
if(_1a79!=null&&_1a79!=undefined){
this.textbox.value=_1a79;
}
dijit.form.TextBox.superclass._setValueAttr.call(this,_1a7a,_1a78);
};
dijit.Dialog.prototype._size=function(){
var mb=dojo.marginBox(this.domNode);
var _1a7c=dijit.getViewport();
if(mb.w>=_1a7c.w||mb.h>=_1a7c.h){
dojo.style(this.containerNode,{height:Math.min(mb.h,Math.floor(_1a7c.h*0.9))+"px",overflow:"auto",position:"relative"});
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
dojo.i18n._preloadLocalizations("dojo.nls.pion-dojo",["ROOT","en","en-gb","en-us","xx"]);
