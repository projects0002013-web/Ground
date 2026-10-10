/* Test-only SDK adapter. Real production code loads the bundled official SDK. */
let user=JSON.parse(localStorage.getItem('test.auth')||'null'),listeners=[];
const changed=value=>{user=value;localStorage.setItem('test.auth',JSON.stringify(user));listeners.forEach(fn=>fn(user));};
async function rpc(action,data={}){if(!navigator.onLine)throw Object.assign(Error('offline'),{code:'functions/unavailable'});const response=await fetch('/__cloud_test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uid:user?.uid,action,data})});const result=await response.json();if(result.error)throw Object.assign(Error(result.error),{code:result.code});return result;}
export const initializeApp=()=>({}),getAuth=()=>({}),setPersistence=async()=>{},browserLocalPersistence={};
export function onAuthStateChanged(_auth,fn){listeners.push(fn);queueMicrotask(()=>fn(user));return()=>{listeners=listeners.filter(x=>x!==fn);};}
export class GoogleAuthProvider{setCustomParameters(){}}
export async function signInWithPopup(){if(window.testPopupBlocked)throw Object.assign(Error('blocked'),{code:'auth/popup-blocked'});changed(window.testNextUser||{uid:'alice',displayName:'Alice',email:'alice@example.test',photoURL:''});}
export async function signInWithRedirect(){window.testRedirectUsed=true;changed(window.testNextUser||{uid:'alice',displayName:'Alice',email:'alice@example.test',photoURL:''});}
export const getRedirectResult=async()=>null,signOut=async()=>changed(null);
export const initializeFirestore=()=>({}),memoryLocalCache=()=>({}),getFunctions=()=>({});
export const httpsCallable=(_fn,name)=>async data=>({data:await rpc(name,data)});
export const doc=(_db,...path)=>({path:path.join('/')}),collection=doc,query=(ref)=>ref,orderBy=()=>{},limit=()=>{},serverTimestamp=()=>({serverTimestamp:true});
export const updateDoc=async(ref,data)=>rpc('preferences',{path:ref.path,...data});
export function onSnapshot(ref,fn,onError){let active=true,previous='';async function poll(){try{const value=await rpc('read',{path:ref.path});const key=JSON.stringify(value);if(active&&key!==previous){previous=key;fn(ref.path.endsWith('/attempts')?{docs:value.map(result=>({data:()=>({result})}))}:{exists:()=>!!value,data:()=>value});}}catch(error){if(active&&navigator.onLine)onError(error);}}const timer=setInterval(poll,150);poll();return()=>{active=false;clearInterval(timer);};}
export const connectAuthEmulator=()=>{},connectFirestoreEmulator=()=>{},connectFunctionsEmulator=()=>{};
