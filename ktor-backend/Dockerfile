FROM gradle:8.4-jdk21 AS cache
RUN mkdir -p /home/gradle/cache_home
ENV GRADLE_USER_HOME=/home/gradle/cache_home
COPY build.gradle.kts settings.gradle.kts /home/gradle/app/
WORKDIR /home/gradle/app
RUN gradle dependencies --no-daemon

FROM gradle:8.4-jdk21 AS build
COPY --from=cache /home/gradle/cache_home /home/gradle/cache_home
ENV GRADLE_USER_HOME=/home/gradle/cache_home
COPY . /home/gradle/src
WORKDIR /home/gradle/src
RUN gradle buildFatJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
EXPOSE 8080
RUN mkdir /app
COPY --from=build /home/gradle/src/build/libs/prismplay-backend.jar /app/prismplay-backend.jar
ENTRYPOINT ["java", "-jar", "/app/prismplay-backend.jar"]