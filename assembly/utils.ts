import { models, neo4j } from "@hypermode/modus-sdk-as"
import {
  OpenAIChatModel,
  ResponseFormat,
  SystemMessage,
  UserMessage,
} from "@hypermode/modus-sdk-as/models/openai/chat"
import { Person, TopicContentPair } from "./classes"
import { JSON } from "json-as"
import { Integer } from "assemblyscript-json/assembly/JSON"
import { EmbeddingsModel } from "@hypermode/modus-sdk-as/models/experimental/embeddings"

// this model name should match the one defined in the modus.json manifest file
const modelName: string = "text-generator"

export function generate_text(instruction: string, prompt: string): string {
  const model = models.getModel<OpenAIChatModel>(modelName)
  const input = model.createInput([
    new SystemMessage(instruction),
    new UserMessage(prompt),
  ])

  // minmize temp to ensure consistency of NER
  input.temperature = 0.3

  const output = model.invoke(input)
  return output.choices[0].message.content.trim()
}

export function unpackStringToTCP(jsonString: string): TopicContentPair[] {
    console.log(`Attempting to parse: ${jsonString}`)
    const parsed = JSON.parse<TopicContentPair[]>(jsonString);
    return parsed
}

export function embed(texts: string[]): f32[][] {
    // "minilm" is the model name declared in the application manifest
    const model = models.getModel<EmbeddingsModel>("minilm")
    const input = model.createInput(texts)
    const output = model.invoke(input)
    return output.predictions
  }

/********************
 * NEO4J logic
 *******************/

export function create_vector_index_safe(): void {
    const createQuery = "CREATE VECTOR INDEX `topic-index` IF NOT EXISTS FOR (t:Topic) ON (t.embedding)"
    neo4j.executeQuery("neo4j", createQuery)
}


export function create_topic(input: string): void {
    // Generate embedding for the topic name
    const embedding = embed([input])[0] // Assume embed returns an array of embeddings

    // Save the topic with its embedding to Neo4j
    const query = `CREATE (node:Topic {name: $name, embedding: $embedding})`
    const vars = new neo4j.Variables()
    vars.set("name", input)
    vars.set("embedding", embedding)
    neo4j.executeQuery("neo4j", query, vars)
}

export function create_message(user: Person, topic: string, message: string): void {
    const embedding = embed([message])[0]
    const query = `
    CREATE (m:Message {name: $messageName, embedding: $embedding})
    WITH m
    MATCH (p:Person {name: $personName})
    MERGE (p)-[:SENT]->(m)
    WITH m
    MATCH (t:Topic {name: $topicName})
    MERGE (m)-[:BELONGS_TO]->(t)
    `
    const vars = new neo4j.Variables()
    vars.set("messageName", message)
    vars.set("embedding", embedding)
    vars.set("personName", user.name)
    vars.set("topicName", topic)
    neo4j.executeQuery("neo4j", query, vars)
}

/** in order of most related first */
export function find_related_topics(topic: string, limit: i16): string[] {
    create_vector_index_safe() // if not already created
    // Generate embedding for the input
    const emb = embed([topic])[0] // Assume one embedding for one topic

    const vars = new neo4j.Variables()
    vars.set("embedding", emb)
    vars.set("limit", limit)

    const query = `
    CALL db.index.vector.queryNodes("topic-index", $limit, $embedding)
    YIELD node AS result, score
    RETURN result.name AS name, score
    ORDER BY score DESC
    `
    const result = neo4j.executeQuery("neo4j", query, vars)

    const relatedTopics: string[] = []

    // Check if query was successful and has records
    if (result && result.Records.length > 0) {
        for (let i = 0; i < result.Records.length; i++) {
            const topicName = result.Records[i].getValue<string>("name")
            const score = result.Records[i].getValue<f32>("score")
            console.log(`topic (${topicName}) score is ${score}`)
            if (score > 0.8) relatedTopics.push(topicName)
        }
    }
    console.log(`related topics: ${relatedTopics}`)
    
    // Return an empty array if no related topics were found
    return relatedTopics
}

export function update_topic_participants(person: Person, topicName: string): void {
    const vars = new neo4j.Variables()
    vars.set("personName", person.name)
    vars.set("topicName", topicName)

    const query = `
    MATCH (p:Person {name: $personName})
    MATCH (t:Topic {name: $topicName})
    MERGE (p)-[:PARTICIPATES_IN]->(t)
    `
    neo4j.executeQuery("neo4j", query, vars)
}

export function update_persons(input: Person): void {
    const query = `
    MERGE (p:Person {name: $name})
    `
    const vars = new neo4j.Variables()
    vars.set("name", input.name)    
    neo4j.executeQuery("neo4j", query, vars)
}