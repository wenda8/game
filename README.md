npm run build

Remove-Item -Recurse -Force docs

Move-Item -Path dist -Destination docs

git add .

git commit -m "添加调试红框和日志"

git push

