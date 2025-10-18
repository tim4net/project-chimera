export interface LocalModelStatus {
  available: boolean;
  endpoint?: string;
  model?: string;
}

export const getLocalModelStatus = (): LocalModelStatus => {
  return {
    available: Boolean(process.env.LOCAL_IMAGE_MODEL_ENDPOINT || process.env.LOCAL_TEXT_MODEL_ENDPOINT),
    endpoint: process.env.LOCAL_IMAGE_MODEL_ENDPOINT ?? process.env.LOCAL_TEXT_MODEL_ENDPOINT ?? undefined,
    model: process.env.LOCAL_IMAGE_MODEL_NAME ?? process.env.LOCAL_TEXT_MODEL_NAME ?? undefined
  };
};
