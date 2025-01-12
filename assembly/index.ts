import { neo4j } from "@hypermode/modus-sdk-as"
import { models } from "@hypermode/modus-sdk-as"
import { EmbeddingsModel } from "@hypermode/modus-sdk-as/models/experimental/embeddings"
import { SlackEventWrapper, SlackChannelMessageEvent, TopicContentPair } from "./classes"
import { JSON } from "json-as"
import { generate_text, unpackStringToTCP } from "./utils"

export function handle_slack_event(input: string): TopicContentPair[] {
  const topic_content_pairs = perform_ner(input)
  return topic_content_pairs
}

/**
 * perform NER at first vs passing entire message text + KG to LLM
 * to increase topic-assignment accuracy
 */
function perform_ner(input: string): TopicContentPair[] {
  const system_prompt = `You take the user input & generate an array of topic-content pairs. Each pair matches this type: { topic: string, content: string }.`;
  const ner_stringified = generate_text(system_prompt, input)
  console.log(ner_stringified)
  const ner_values = unpackStringToTCP(ner_stringified)
  return ner_values
}