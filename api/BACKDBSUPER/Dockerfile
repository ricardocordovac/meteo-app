     FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
     WORKDIR /app
     COPY *.csproj ./
     RUN dotnet restore
     COPY . ./
     RUN dotnet publish BACKDBSUPER.csproj -c Release -o out

     FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
     WORKDIR /app
     COPY --from=build /app/out ./
     COPY appsettings.json ./
     COPY appsettings.Development.json ./
     EXPOSE 5100
     ENV ASPNETCORE_URLS=http://+:5100
     ENTRYPOINT ["dotnet", "BACKDBSUPER.dll"]