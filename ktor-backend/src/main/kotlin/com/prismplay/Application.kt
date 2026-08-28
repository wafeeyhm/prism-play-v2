package com.prismplay

import io.ktor.http.*
import io.ktor.serialization.gson.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import com.google.gson.JsonObject

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0") {
        install(ContentNegotiation) {
            gson()
        }
        install(CORS) {
            anyHost()
            allowHeader(HttpHeaders.ContentType)
            allowMethod(HttpMethod.Post)
            allowMethod(HttpMethod.Get)
        }
        routing {
            get("/api/repositories") {
                call.respond(mapOf("repositories" to CloudstreamBridge.getRepositories()))
            }

            get("/api/installed-plugins") {
                call.respond(mapOf("plugins" to CloudstreamBridge.getInstalledPlugins()))
            }

            post("/api/plugins/install") {
                val body = call.receive<JsonObject>()
                val url = body.get("url")?.asString ?: return@post call.respond(
                    HttpStatusCode.BadRequest,
                    mapOf("success" to false, "error" to "URL required")
                )
                val result = CloudstreamBridge.installRepo(url)
                call.respond(result)
            }

            post("/api/provider/toggle") {
                val body = call.receive<JsonObject>()
                val name = body.get("name")?.asString ?: return@post call.respond(HttpStatusCode.BadRequest)
                val install = body.get("install")?.asBoolean ?: true
                CloudstreamBridge.toggleInstall(name, install)
                call.respond(mapOf("success" to true))
            }

            get("/api/homepage") {
                val provider = call.request.queryParameters["provider"] ?: "Default"
                call.respond(mapOf("categories" to CloudstreamBridge.getHomePage(provider)))
            }

            get("/api/search") {
                val provider = call.request.queryParameters["provider"] ?: "Default"
                val query = call.request.queryParameters["query"] ?: ""
                call.respond(mapOf("results" to CloudstreamBridge.searchProvider(provider, query)))
            }

            get("/api/streams") {
                val provider = call.request.queryParameters["provider"] ?: "Default"
                val targetUrl = call.request.queryParameters["url"] ?: "https://example.com"
                call.respond(mapOf("streams" to CloudstreamBridge.resolveStreams(provider, targetUrl)))
            }
        }
    }.start(wait = true)
}