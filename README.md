Remove-Item -Recurse -Force docs

npm run build

git add .

git commit -m "添加调试红框和日志"

git push

$env:Path += ";D:\nodejs"