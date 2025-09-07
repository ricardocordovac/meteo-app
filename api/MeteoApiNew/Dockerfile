# Consulte https://aka.ms/customizecontainer para aprender a personalizar su contenedor de depuración y cómo Visual Studio usa este Dockerfile para compilar sus imágenes para una depuración más rápida.

# Esta fase se usa cuando se ejecuta desde VS en modo rápido (valor predeterminado para la configuración de depuración)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080


# Esta fase se usa para compilar el proyecto de servicio
# FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
# ARG BUILD_CONFIGURATION=Release
# WORKDIR /src
# COPY ["MeteoApiNew/MeteoApiNew.csproj", "MeteoApiNew/"]
# RUN dotnet restore "./MeteoApiNew/MeteoApiNew.csproj"
# COPY . .
# WORKDIR "/src/MeteoApiNew"
# RUN dotnet build "./MeteoApiNew.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Esta fase se usa para publicar el proyecto de servicio que se copiará en la fase final.
# FROM build AS publish
# ARG BUILD_CONFIGURATION=Release
# RUN dotnet publish "./MeteoApiNew.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Esta fase se usa en producción o cuando se ejecuta desde VS en modo normal (valor predeterminado cuando no se usa la configuración de depuración)
# FROM base AS final
# WORKDIR /app
# COPY --from=publish /app/publish .
# ENTRYPOINT ["dotnet", "MeteoApiNew.dll"]

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
COPY *.csproj ./
RUN dotnet restore
COPY . ./
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/out ./
COPY appsettings.json ./
EXPOSE 5100
ENV ASPNETCORE_URLS=http://+:5100
ENTRYPOINT ["dotnet", "MeteoApiNew.dll"]
