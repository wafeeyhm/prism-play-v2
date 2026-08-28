package com.prismplay

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.request.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.gson.*
import io.ktor.http.*

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module).start(wait = true)
}

fun Application.module() {
    install(CORS) {
        anyHost()
        allowHeader(HttpHeaders.ContentType)
    }

    install(ContentNegotiation) {
        gson { }
    }

    routing {
        get("/") {
            call.respondText("PrismPlay Kotlin JVM Bridge is running!")
        }

        get("/api/plugins") {
            call.respond(mapOf("plugins" to CloudstreamBridge.getPlugins()))
        }

        post("/api/plugins/install") {
            val request = call.receive<Map<String, String>>()
            val url =
                request["url"] ?: return@post call.respond(HttpStatusCode.BadRequest, mapOf("error" to "URL required"))
            val result = CloudstreamBridge.installRepo(url)
            call.respond(result)
        }

        get("/api/repositories") {
            call.respond(mapOf("repositories" to CloudstreamBridge.getRepositories()))
        }

        get("/api/search") {
            val provider = call.request.queryParameters["provider"] ?: return@get call.respond(
                HttpStatusCode.BadRequest,
                mapOf("error" to "Provider required")
            )
            val query = call.request.queryParameters["query"] ?: ""
            val results = CloudstreamBridge.searchProvider(provider, query)
            call.respond(mapOf("results" to results))
        }

        get("/api/homepage") {
            val provider = call.request.queryParameters["provider"] ?: return@get call.respond(
                HttpStatusCode.BadRequest,
                mapOf("error" to "Provider required")
            )
            val categories = CloudstreamBridge.getHomePage(provider)
            call.respond(mapOf("categories" to categories))
        }
    }
}