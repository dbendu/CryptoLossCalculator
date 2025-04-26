## Команды для деплоя

### API

`dotnet publish -c Release -r linux-x64 --self-contained true -p:PublishSingleFile=true -o ./publish`

`scp -r publish root@138.124.78.107:/root/crypto-loss-calculator/api`

`chmod +x CryptoLossCalculator.Api`

`ASPNETCORE_ENVIRONMENT=Production nohup ./CryptoLossCalculator.Api > /root/crypto-loss-calculator/logs/api 2>&1 &`

### Front

`nohup python3 -m http.server 5068 > /root/crypto-loss-calculator/logs/front 2>&1 &`

### Общее

`jobs`