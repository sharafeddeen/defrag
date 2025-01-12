import { neo4j } from "@hypermode/modus-sdk-as"
import { models } from "@hypermode/modus-sdk-as"
import { EmbeddingsModel } from "@hypermode/modus-sdk-as/models/experimental/embeddings"
import { SlackEventWrapper, SlackChannelMessageEvent, TopicContentPair } from "./classes"
import { JSON } from "json-as"
import { assign_message_to_topic, create_message, create_topic, generate_text, unpackStringToTCP } from "./utils"

export function handle_slack_event(input: string): TopicContentPair[] {
  const topic_content_pairs = perform_ner(input)
  return topic_content_pairs
}

/**
 * perform NER at first vs passing entire message text + KG to LLM
 * to increase topic-assignment accuracy
 */
function perform_ner(input: string): TopicContentPair[] {
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
  ner_values.forEach(val => {
    create_topic(val.topic)
    create_message(val.content)
    assign_message_to_topic(val.content, val.topic)
  })
  return ner_values
}