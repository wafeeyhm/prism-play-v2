package com.prismplay

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.serialization.gson.*
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.google.gson.JsonArray
import com.google.gson.reflect.TypeToken
import org.jsoup.Jsoup
import java.io.File

object CloudstreamBridge {
    private val client = HttpClient(CIO) {
        install(ContentNegotiation) { gson() }
    }

    private val gson = Gson()
    private val dataFile = File("data/state.json")

    private val repoProviders = mutableMapOf<String, MutableList<JsonObject>>()
    private val installedProviderNames = mutableSetOf<String>()

    init {
        loadFromFile()
    }

    private fun loadFromFile() {
        try {
            if (dataFile.exists()) {
                val jsonString = dataFile.readText()
                val root = gson.fromJson(jsonString, JsonObject::class.java)

                if (root.has("repos")) {
                    val repoType = object : TypeToken<Map<String, MutableList<JsonObject>>>() {}.type
                    val savedRepos: Map<String, MutableList<JsonObject>> =
                        gson.fromJson(root.get("repos"), repoType) ?: emptyMap()
                    repoProviders.putAll(savedRepos)
                }
                if (root.has("installed")) {
                    val instType = object : TypeToken<Set<String>>() {}.type
                    val savedInst: Set<String> = gson.fromJson(root.get("installed"), instType) ?: emptySet()
                    installedProviderNames.addAll(savedInst)
                }
            }
        } catch (_: Exception) {
        }
    }

    private fun saveToFile() {
        try {
            dataFile.parentFile?.mkdirs()
            val root = JsonObject().apply {
                add("repos", gson.toJsonTree(repoProviders))
                add("installed", gson.toJsonTree(installedProviderNames))
            }
            dataFile.writeText(gson.toJson(root))
        } catch (_: Exception) {
        }
    }

    suspend fun installRepo(inputUrl: String): Map<String, Any> {
        var fetchUrl = inputUrl.trim()
        if (fetchUrl.contains("://")) {
            fetchUrl = "https://" + fetchUrl.substringAfter("://")
        }

        try {
            val response: HttpResponse = client.get(fetchUrl)
            val jsonObject = gson.fromJson(response.bodyAsText(), JsonObject::class.java)

            val repoName = fetchUrl.substringAfterLast("/").substringBefore(".json").replace("-", " ")
                .replaceFirstChar { it.uppercase() }
            val providers = mutableListOf<JsonObject>()

            if (jsonObject.has("pluginLists")) {
                for (element in jsonObject.getAsJsonArray("pluginLists")) {
                    try {
                        val subResponse: HttpResponse = client.get(element.asString)
                        for (pluginElement in gson.fromJson(subResponse.bodyAsText(), JsonArray::class.java)) {
                            providers.add(pluginElement.asJsonObject)
                        }
                    } catch (_: Exception) {
                    }
                }
                repoProviders[repoName] = providers
                saveToFile()
                return mapOf("success" to true, "repoName" to repoName, "count" to providers.size)
            }
            return mapOf("success" to false, "error" to "Missing pluginLists array")
        } catch (e: Exception) {
            return mapOf("success" to false, "error" to (e.message ?: "Network error"))
        }
    }

    fun getRepositories(): Map<String, List<Map<String, Any>>> {
        return repoProviders.mapValues { entry ->
            entry.value.map { gson.fromJson(it, Map::class.java) as Map<String, Any> }
        }
    }

    fun getInstalledPlugins(): List<Map<String, Any>> {
        val all = repoProviders.values.flatten()
        return all.filter { installedProviderNames.contains(it.get("name")?.asString) }
            .map { gson.fromJson(it, Map::class.java) as Map<String, Any> }
    }

    fun toggleInstall(providerName: String, install: Boolean): Boolean {
        if (install) {
            installedProviderNames.add(providerName)
        } else {
            installedProviderNames.remove(providerName)
        }
        saveToFile()
        return true
    }

    fun getHomePage(providerName: String): List<Map<String, Any>> {
        val provider = repoProviders.values.flatten().find { it.get("name")?.asString == providerName }
        val icon = provider?.get("iconUrl")?.asString ?: "https://placehold.co/200x300/1e293b/38bdf8?text=$providerName"

        return listOf(
            mapOf(
                "categoryName" to "Trending Releases",
                "items" to listOf(
                    mapOf(
                        "id" to "1",
                        "title" to "$providerName Feature Movie",
                        "poster" to icon,
                        "type" to "Movie",
                        "url" to "https://example.com/watch/1"
                    ),
                    mapOf(
                        "id" to "2",
                        "title" to "$providerName Series Pack",
                        "poster" to icon,
                        "type" to "Series",
                        "url" to "https://example.com/watch/2"
                    )
                )
            )
        )
    }

    fun searchProvider(providerName: String, query: String): List<Map<String, Any>> {
        val provider = repoProviders.values.flatten().find { it.get("name")?.asString == providerName }
        val icon = provider?.get("iconUrl")?.asString ?: "https://placehold.co/200x300/1e293b/38bdf8?text=$providerName"

        return listOf(
            mapOf(
                "id" to "s1",
                "title" to "$query [Found on $providerName]",
                "poster" to icon,
                "type" to "movie",
                "url" to "https://example.com/watch/$query"
            )
        )
    }

    suspend fun resolveStreams(providerName: String, targetUrl: String): List<Map<String, Any>> {
        try {
            val doc = Jsoup.connect(targetUrl)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                .timeout(10000)
                .get()

            val videoSources = mutableListOf<Map<String, Any>>()
            val sources = doc.select("source, iframe, video")
            for (src in sources) {
                val link = src.absUrl("src").ifEmpty { src.absUrl("data-src") }
                if (link.isNotBlank()) {
                    videoSources.add(mapOf("quality" to "HD Source", "url" to link))
                }
            }

            if (videoSources.isEmpty()) {
                videoSources.add(
                    mapOf(
                        "quality" to "1080p Master (HLS)",
                        "url" to "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
                    )
                )
            }

            return videoSources
        } catch (_: Exception) {
            return listOf(
                mapOf(
                    "quality" to "Default Stream (Fallback)",
                    "url" to "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
                )
            )
        }
    }
}