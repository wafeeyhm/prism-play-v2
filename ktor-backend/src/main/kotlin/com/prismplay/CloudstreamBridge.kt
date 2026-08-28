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
import java.io.File

object CloudstreamBridge {
    private val client = HttpClient(CIO) {
        install(ContentNegotiation) { gson() }
    }

    private val gson = Gson()
    private val dataFile = File("data/repositories.json")

    // Maps Repository Name -> List of Providers inside it
    private val installedRepos = mutableMapOf<String, MutableList<JsonObject>>()

    init {
        loadFromFile()
    }

    private fun loadFromFile() {
        try {
            if (dataFile.exists()) {
                val jsonString = dataFile.readText()
                val type = object : TypeToken<Map<String, MutableList<JsonObject>>>() {}.type
                val saved: Map<String, MutableList<JsonObject>> = gson.fromJson(jsonString, type) ?: emptyMap()
                installedRepos.putAll(saved)
            }
        } catch (_: Exception) {
        }
    }

    private fun saveToFile() {
        try {
            dataFile.parentFile?.mkdirs()
            dataFile.writeText(gson.toJson(installedRepos))
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
                        val subUrl = element.asString
                        val subResponse: HttpResponse = client.get(subUrl)
                        for (pluginElement in gson.fromJson(subResponse.bodyAsText(), JsonArray::class.java)) {
                            providers.add(pluginElement.asJsonObject)
                        }
                    } catch (_: Exception) {
                    }
                }
                installedRepos[repoName] = providers
                saveToFile()
                return mapOf("success" to true, "repoName" to repoName, "count" to providers.size)
            }
            return mapOf("success" to false, "error" to "Missing pluginLists array in repository JSON")
        } catch (e: Exception) {
            return mapOf("success" to false, "error" to (e.message ?: "Network or parsing exception"))
        }
    }

    fun getRepositories(): Map<String, List<Map<String, Any>>> {
        return installedRepos.mapValues { entry ->
            entry.value.map { gson.fromJson(it, Map::class.java) as Map<String, Any> }
        }
    }

    fun getPlugins(): List<Map<String, Any>> {
        val all = mutableListOf<Map<String, Any>>()
        installedRepos.values.forEach { list ->
            list.forEach { all.add(gson.fromJson(it, Map::class.java) as Map<String, Any>) }
        }
        return all
    }

    fun getHomePage(providerName: String): List<Map<String, Any>> {
        val provider = installedRepos.values.flatten().find { it.get("name")?.asString == providerName }
        val desc = provider?.get("description")?.asString ?: "Cloudstream community extension provider."
        val icon = provider?.get("iconUrl")?.asString ?: "https://placehold.co/200x300/1e293b/38bdf8?text=$providerName"
        val lang = provider?.get("lang")?.asString ?: "en"

        return listOf(
            mapOf(
                "categoryName" to "Featured Content ($lang)",
                "items" to listOf(
                    mapOf(
                        "id" to "1",
                        "title" to "$providerName - Trending Release 1",
                        "poster" to icon,
                        "type" to "Movie",
                        "description" to desc
                    ),
                    mapOf(
                        "id" to "2",
                        "title" to "$providerName - Series Pack",
                        "poster" to icon,
                        "type" to "Series",
                        "description" to desc
                    )
                )
            )
        )
    }

    fun searchProvider(providerName: String, query: String): List<Map<String, Any>> {
        val provider = installedRepos.values.flatten().find { it.get("name")?.asString == providerName }
        val icon = provider?.get("iconUrl")?.asString ?: "https://placehold.co/200x300/1e293b/38bdf8?text=$providerName"

        return listOf(
            mapOf("id" to "s1", "title" to "$query [Found on $providerName]", "poster" to icon, "type" to "movie"),
            mapOf("id" to "s2", "title" to "$query (Complete Season)", "poster" to icon, "type" to "series")
        )
    }
}