export const TYPES = {acute:{name:'예각삼각형',points:1},right:{name:'직각삼각형',points:2},obtuse:{name:'둔각삼각형',points:3}};
const edgeKey=(a,b)=>a<b?`${a}:${b}`:`${b}:${a}`;
const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
const on=(a,b,p)=>cross(a,b,p)===0&&p.x>=Math.min(a.x,b.x)&&p.x<=Math.max(a.x,b.x)&&p.y>=Math.min(a.y,b.y)&&p.y<=Math.max(a.y,b.y);
export function makePoints(n,seed){
 let z=seed>>>0; const rnd=()=>{z=(Math.imul(z,1664525)+1013904223)>>>0;return z/4294967296};
 const cols=n===12?4:n===20?5:6, rows=Math.ceil(n/cols),out=[];
 for(let i=0;i<n;i++){const col=i%cols,row=Math.floor(i/cols);out.push({x:80+col*Math.round(640/(cols-1))+(i<cols+1?0:Math.floor(rnd()*3)*20-20),y:70+row*Math.round(440/(rows-1))+(i<cols+1?0:Math.floor(rnd()*3)*20-20)})}return out;
}
export function classify(points,ids){
 const p=ids.map(i=>points[i]);if(cross(...p)===0)return null;
 const d=[0,1,2].map(i=>{const a=p[i],b=p[(i+1)%3];return (a.x-b.x)**2+(a.y-b.y)**2}).sort((a,b)=>a-b);
 const delta=d[2]-d[0]-d[1],eps=Math.max(...d)*1e-10;
 return Math.abs(delta)<=eps?'right':delta>0?'obtuse':'acute';
}
export function legalReason(points,moves,a,b){
 if(!Number.isInteger(a)||!Number.isInteger(b)||!points[a]||!points[b])return '놀이판의 점을 선택해 주세요.';
 if(a===b)return '서로 다른 두 점을 선택해 주세요.';
 if(moves.some(e=>edgeKey(e.a,e.b)===edgeKey(a,b)))return '이미 그려진 선분이에요.';
 const A=points[a],B=points[b];
 if(points.some((p,i)=>i!==a&&i!==b&&on(A,B,p)))return '다른 점을 통과할 수 없어요. 중간의 점을 선택하세요.';
 for(const e of moves){
  if([e.a,e.b].includes(a)||[e.a,e.b].includes(b))continue;
  const C=points[e.a],D=points[e.b];const c1=cross(A,B,C),c2=cross(A,B,D),c3=cross(C,D,A),c4=cross(C,D,B);
  if((c1*c2<0&&c3*c4<0)||on(A,B,C)||on(A,B,D)||on(C,D,A)||on(C,D,B))return '기존 선분과 교차할 수 없어요.';
 }return '';
}
export function replay(config,rawMoves,starter=0){
 const points=makePoints(config.n,config.seed),moves=[],triangles=[],edges=new Set(),scores=[0,0],counts=[{acute:0,right:0,obtuse:0},{acute:0,right:0,obtuse:0}];
 if(typeof rawMoves==='string'){if(rawMoves&&!/^\d+,\d+,[01];(?:\d+,\d+,[01];)*$/.test(rawMoves))throw Error('선분 기록 형식이 맞지 않습니다.');rawMoves=Object.fromEntries(rawMoves.split(';').filter(Boolean).map((s,i)=>{const [a,b,p]=s.split(',').map(Number);return [`m${i}`,{a,b,p}]}))}
 const ordered=Object.entries(rawMoves||{}).sort((a,b)=>Number(a[0].slice(1))-Number(b[0].slice(1)));
 for(let i=0;i<ordered.length;i++){
  const [key,m]=ordered[i];if(key!==`m${i}`||m.p!==(starter+i)%2||legalReason(points,moves,m.a,m.b))throw new Error('대결 기록이 올바르지 않습니다. 방을 새로 만들어 주세요.');
  for(let c=0;c<points.length;c++)if(c!==m.a&&c!==m.b&&edges.has(edgeKey(m.a,c))&&edges.has(edgeKey(m.b,c))){
   const ids=[m.a,m.b,c],type=classify(points,ids);if(type){triangles.push({ids,type,p:m.p,move:i});scores[m.p]+=TYPES[type].points;counts[m.p][type]++;}
  }edges.add(edgeKey(m.a,m.b));moves.push(m);
 }
 let remaining=0;
 for(let a=0;a<points.length;a++)for(let b=a+1;b<points.length;b++)if(!legalReason(points,moves,a,b))remaining++;
 return {points,moves,triangles,scores,counts,remaining,turn:(starter+moves.length)%2,finished:remaining===0};
}
export function handWinner(h,g){return h===g?-1:(h+2)%3===g?0:1;}
export function angles(points,ids){return ids.map((id,i)=>{const a=points[id],b=points[ids[(i+1)%3]],c=points[ids[(i+2)%3]];const u=[b.x-a.x,b.y-a.y],v=[c.x-a.x,c.y-a.y];return Math.acos(Math.max(-1,Math.min(1,(u[0]*v[0]+u[1]*v[1])/(Math.hypot(...u)*Math.hypot(...v)))))*180/Math.PI;});}
