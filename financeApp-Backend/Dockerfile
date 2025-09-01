# ---------- Build Stage ----------
FROM maven:3.9.11-eclipse-temurin-17 AS build
WORKDIR /build

# Cache dependencies
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

# Build the app
COPY src ./src
RUN mvn -q -DskipTests package

# ---------- Runtime Stage ----------
FROM eclipse-temurin:17-jre-jammy    
WORKDIR /app

# Copy the built JAR
COPY --from=build /build/target/*.jar app.jar

# Optional JVM flags (tune as you like)
ENV JAVA_OPTS=""

EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
