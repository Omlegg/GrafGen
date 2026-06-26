# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy only csproj and restore
COPY BackEnd/BackEnd.csproj ./BackEnd/
RUN dotnet restore ./BackEnd/BackEnd.csproj

# Copy the rest of the source
COPY . .
WORKDIR /src/BackEnd
RUN dotnet publish -c Release -o /app/out

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "BackEnd.dll"]
