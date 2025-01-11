import { models } from "@hypermode/modus-sdk-as"
import { EmbeddingsModel } from "@hypermode/modus-sdk-as/models/experimental/embeddings"

export function embed(texts: string[]): f32[][] {
  // "minilm" is the model name declared in the application manifest
  const model = models.getModel<EmbeddingsModel>("minilm")
  const input = model.createInput(texts)
  const output = model.invoke(input)
  return output.predictions
}
