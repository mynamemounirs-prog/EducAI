// A stalled profile service must not leave account creation waiting indefinitely.
// Timing out does not cancel Firebase requests: never treat this as proof that a write failed.
export function withDeadline<T>(operation:Promise<T>,message:string,ms=8000):Promise<T>{
 let timer:ReturnType<typeof setTimeout>;
 return Promise.race([operation,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),ms)})]).finally(()=>clearTimeout(timer));
}
