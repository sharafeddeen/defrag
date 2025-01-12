import { neo4j } from "@hypermode/modus-sdk-as"
import { models } from "@hypermode/modus-sdk-as"
import { EmbeddingsModel } from "@hypermode/modus-sdk-as/models/experimental/embeddings"
import { SlackEventWrapper, SlackChannelMessageEvent, EntityContentPair } from "./classes"
import { JSON } from "json-as"

export function handle_slack_event(input: string): string {
  const entity_content_pairs = perform_ner(input)

  return "hello"
}

function perform_ner(input: string): EntityContentPair[] {
  return []
}