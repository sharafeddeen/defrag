import { models, neo4j } from "@hypermode/modus-sdk-as"
import {
  OpenAIChatModel,
  ResponseFormat,
  SystemMessage,
  UserMessage,
} from "@hypermode/modus-sdk-as/models/openai/chat"
import { TopicContentPair } from "./classes"
import { JSON } from "json-as"

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

/**
 * NEO4J logic
 */

export function create_topic(input: string): void {
    const query = `CREATE (node:Topic {name: "${input}"})`
    const result = neo4j.executeQuery("neo4j", query)
}

export function create_message(input: string): void {
    const query = `CREATE (node:Message {name: "${input}"})`
    const result = neo4j.executeQuery("neo4j", query)
}

export function assign_message_to_topic(message: string, topic: string): void {
    const query = `
    MATCH (m:Message WHERE m.name = "${message}")
    MATCH (t:Topic WHERE t.name = "${topic}")
    CREATE (m)-[:BELONGS_TO]->(t)
    `
    const result = neo4j.executeQuery("neo4j", query)
}