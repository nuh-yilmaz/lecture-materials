// Simulated Google Sheet for the Apps Script tests: load(codePath) runs Code.gs and returns helpers.
const fs=require('fs'), vm=require('vm');
function Sheet(name){ this.name=name; this.rows=[]; this.frozen=0; }
Sheet.prototype.getName=function(){ return this.name; };
Sheet.prototype.getLastRow=function(){ return this.rows.length; };
Sheet.prototype.getLastColumn=function(){ return this.rows.reduce((m,r)=>Math.max(m,r.length),0); };
Sheet.prototype.appendRow=function(r){ this.rows.push(r.slice()); };
Sheet.prototype.setFrozenRows=function(n){ this.frozen=n; };
Sheet.prototype.clear=function(){ this.rows=[]; };
Sheet.prototype.getRange=function(r,c,nr=1,nc=1){ const sh=this; return {
  getValues(){ const v=[]; for(let i=0;i<nr;i++){ const row=sh.rows[r-1+i]||[]; const o=[]; for(let j=0;j<nc;j++) o.push(row[c-1+j]===undefined?'':row[c-1+j]); v.push(o);} return v; },
  setValues(v){ if(v.length!==nr||v.some(x=>x.length!==nc)) throw new Error(`setValues size ${v.length}x${v[0].length} != ${nr}x${nc}`);
    for(let i=0;i<nr;i++){ while(sh.rows.length<r+i) sh.rows.push([]); const row=sh.rows[r-1+i]; for(let j=0;j<nc;j++){ while(row.length<c-1+j) row.push(''); row[c-1+j]=v[i][j]; } } },
  setValue(x){ this.setValues([[x]]); }, setFontWeight(){ return this; } }; };
function load(codePath){
  const book={}, ui={alerts:[],menus:[]}; let active=null;
  const SS={getSheetByName:n=>book[n]||null, insertSheet:n=>(book[n]=new Sheet(n)), getActiveSheet:()=>active};
  const ctx={ SpreadsheetApp:{getActiveSpreadsheet:()=>SS, getActiveSheet:()=>active,
      getUi:()=>({alert:m=>ui.alerts.push(m), createMenu:t=>{ const m={title:t,items:[]}; ui.menus.push(m); return {addItem(l,f){ m.items.push([l,f]); return this; }, addToUi(){}}; }})},
    LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},
    ContentService:{MimeType:{JSON:'json'},createTextOutput:t=>({t,setMimeType(){return this;}})}, console, Date, JSON, Array, String, Number, isFinite, Error, Math, parseInt, Object, RegExp };
  vm.createContext(ctx); vm.runInContext(fs.readFileSync(codePath,'utf8'),ctx);
  const post=d=>JSON.parse(ctx.doPost({postData:{contents:JSON.stringify(d)}}).t);
  const H=n=>book[n].rows[0].map(String), cell=(n,r,h)=>book[n].rows[r][H(n).indexOf(h)];
  return {ctx,book,ui,post,H,cell,setActive:n=>{active=book[n];}};
}
module.exports={load};
