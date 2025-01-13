import { neo4j } from "@hypermode/modus-sdk-as"
import { models } from "@hypermode/modus-sdk-as"
import { EmbeddingsModel } from "@hypermode/modus-sdk-as/models/experimental/embeddings"
import { TopicContentPair, Person, Message } from "./classes"
import { JSON } from "json-as"
import { create_message, create_topic, find_related_topics, generate_text, unpackStringToTCP, update_persons, update_topic_participants } from "./utils"

export function channel_a(user: string, input: string): TopicContentPair[] {
  return handle_slack_event(user, input)
}

export function channel_b(user: string, input: string): TopicContentPair[] {
  return handle_slack_event(user, input)
}

function handle_slack_event(user: string, input: string): TopicContentPair[] {
  const topic_content_pairs = perform_ner_incoming_message(input)
  const person = new Person(user)
  update_kg(person, topic_content_pairs)
  return topic_content_pairs
}

/**
 * perform NER at first vs passing entire message text + KG to LLM
 * to increase topic-assignment accuracy
 */
function perform_ner_incoming_message(input: string): TopicContentPair[] {
  const system_prompt = `You take the user input & generate ONLY an array of topic-content pairs that describes that input.
  Extract the topic from a logically coherent & separate piece of the message, and assign that piece to the content part of the pair.
  A message will contain at least one pair, but maybe more.
  Each pair matches this type: { topic: string, content: string }.
  -------------------
  Example:
  * input: 'Did we get the budget estimate?'
  * output: '[{"topic": "Budget Estimate", "content": "Did we get the budget estimate?"}]'
  -------------------
  Generate outputs matching the example above (i.e., only the array of topic-content pairs)!
  DO NOT generate a program to solve the problem. You must directly generate the output itself and nothing else outside of the output.
  You need to make sure that the content of all generated pairs amounts to the input eactly, without ommitting anything!
  `;
  const ner_stringified = generate_text(system_prompt, input)
  const ner_values = unpackStringToTCP(ner_stringified)
  return ner_values
}

function update_kg(user: Person, pairs: TopicContentPair[]): void {
  // Update the person in the knowledge graph
  update_persons(user)
  for (let i = 0; i < pairs.length; i++) {
    const val = pairs[i]

    // Find related topics and handle topic creation or association
    const relatedTopics = find_related_topics(val.topic, 2)
    if (relatedTopics.length == 0) {
      create_topic(val.topic)
    } else {
      val.topic = relatedTopics[0]
    }

    update_topic_participants(user, val.topic)

    create_message(user, val.topic, val.content)
  }
}

export function search_kg(input: string): string {
  const topics = find_related_topics(input, 1000, 0.6) // just a temp hack around enabling vector search after ner
  const system_prompt = `
  Consider a knowledge graph with the following node & relationship types:
  ============================
  Person (node):
  """
  - name: string; (attribute)
  - sent: Message[]; (relationship)
  """
  Message (node):
  """
  - content: string; (attribute)
  - timestamp: number; (attribute)
  - belongs_to: Topic; (relationship)
  """
  Topic (node):
  """
  - name: string; (attribute)
  """
  (Person)-[:SENT]->(Message)
  (Message)-[:BELONGS_TO]->(Topic)
  ============================
  
  Write a Cypher query to answer the user's prompt.
  Your output must only be the query & nothing else.
  
  Example:
  - input: "Who are the people in here?"
  - output: "MATCH (p:Person) RETURN p"
  
  Your output must return all the attributes of a node, not just a single attribute, unless explicitly instructed by the user.
  DO NOT wrap the output query in backticks!

  Note that, depending on the user prompt, you may return all messages.
  
  Here are the existing topics in the knowledge graph related to the user message: [${topics}]
  `
  const query = generate_text(system_prompt, input)
  const query_results = neo4j.executeQuery("neo4j", query).Records
  let stres: string[] = []
  for (let i = 0; i < query_results.length; i++) stres.push(JSON.stringify(query_results[i].asMap()))
  const system_prompt_with_context = `Answer the user prompt given this context: ${stres}`
  return generate_text(system_prompt_with_context, input)
}