@echo off
node -e "const h=require('http'),f=require('fs');h.createServer((q,r)=>{f.readFile('C:/Users/User/Desktop/EngineerOS_DENEME_CODEX/8.0/public/engvox-landing.html',(e,d)=>{r.writeHead(200,{'Content-Type':'text/html'});r.end(d)})}).listen(3001,()=>console.log('OK'))"
