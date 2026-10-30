FROM maven:3.9-eclipse-temurin-25 AS build

WORKDIR /workspace
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw mvnw.cmd ./
RUN mvn -B dependency:go-offline

COPY src src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:25-jre

WORKDIR /app
COPY --from=build /workspace/target/TransportManagementSystem-0.0.1-SNAPSHOT.jar app.jar

ENV JAVA_OPTS=""
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "if [ -n \"${DATABASE_URL:-}\" ] && [ -z \"${DB_URL:-}\" ]; then db_url=\"${DATABASE_URL#*://}\"; db_credentials=\"${db_url%@*}\"; db_host=\"${db_url#*@}\"; export DB_USERNAME=\"${DB_USERNAME:-${db_credentials%%:*}}\"; export DB_PASSWORD=\"${DB_PASSWORD:-${db_credentials#*:}}\"; export DB_URL=\"jdbc:postgresql://${db_host}\"; fi; exec java $JAVA_OPTS -jar app.jar"]
