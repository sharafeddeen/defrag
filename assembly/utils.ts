import { models } from "@hypermode/modus-sdk-as"
import {
  OpenAIChatModel,
  ResponseFormat,
  SystemMessage,
  UserMessage,
} from "@hypermode/modus-sdk-as/models/openai/chat"
import { TopicContentPair } from "./classes"

// this model name should match the one defined in the modus.json manifest file
const modelName: string = "text-generator"

export function generate_text(instruction: string, prompt: string): string {
  const model = models.getModel<OpenAIChatModel>(modelName)
  const input = model.createInput([
    new SystemMessage(instruction),
    new UserMessage(prompt),
  ])

  // minmize temp to ensure consistency of NER
  input.temperature = 0.0

  const output = model.invoke(input)
  return output.choices[0].message.content.trim()
}

// Function to unpack the string into an array of TopicContentPair objects
export function unpackStringToTCP(data: string): TopicContentPair[] {
    const pairs: TopicContentPair[] = [];
    const entries = data.split(";"); // Split by semicolon to get each topic-content pair

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const parts = entry.split(":"); // Split by colon to separate topic and content
        if (parts.length == 2) {
            const topic = parts[0].trim();
            const content = parts[1].trim();
            pairs.push(new TopicContentPair(topic, content));
        }
    }

    return pairs;
}