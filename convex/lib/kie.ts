export interface KieResponse {
  code: number;
  message: string;
  data: {
    taskId: string;
  };
}

export async function createImageWithKie(params: {
  model: string;
  prompt: string;
  imageUrls: string[];
  aspectRatio: string;
}): Promise<string> {
  const { model, prompt, imageUrls, aspectRatio } = params;

  // Trim model name to remove any trailing/leading spaces
  const trimmedModel = model.trim();

  //get enviornment variables from convex

  const apiKey = process.env.KIE_API_KEY;
  const convexSiteUrl = process.env.CONVEX_SITE_URL;

  //build callback urls

  const callBackUrl = `${convexSiteUrl}/webhook/kie-image`;

  // Validate required environment variables
  if (!apiKey) {
    throw new Error(
      'KIE_API_KEY is not set in environment variables'
    );
  }
  if (!convexSiteUrl) {
    throw new Error(
      'CONVEX_SITE_URL is not set in environment variables'
    );
  }

  const requestBody = {
    model: trimmedModel,
    callBackUrl,
    input: {
      prompt,
      image_urls: imageUrls,
      output_format: 'png',
      image_size: aspectRatio,
      resolution: '1K', //flux
      aspect_ratio: aspectRatio, //flux,seedream
      quality: 'basic', //seedream
      input_urls: imageUrls, //flux
    },
  };

  console.log('Calling KIE API with:', {
    model: trimmedModel,
    prompt: prompt.substring(0, 50) + '...',
    imageUrlsCount: imageUrls.length,
    aspectRatio,
  });

  //call Kie.ai API

  const response = await fetch(
    'https://api.kie.ai/api/v1/jobs/createTask',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      'Failed to create image with Kie:',
      `Status: ${response.status}`,
      `StatusText: ${response.statusText}`,
      `Error: ${errorText}`
    );
    throw new Error(
      `Failed to create image with Kie: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const result: KieResponse = await response.json();

  if (result.code !== 200) {
    console.error('Failed to create image with Kie:', result.message);
    throw new Error(
      `Failed to create image with Kie: ${result.message}`
    );
  }

  return result.data.taskId;
}

export async function createVideoWithKie(params: {
  model: string;
  prompt: string;
  imageUrls: string[];
  aspectRatio: string;
}): Promise<string> {
  const { model, prompt, imageUrls, aspectRatio } = params;

  // Trim model name to remove any trailing/leading spaces
  const trimmedModel = model.trim();

  //get enviornment variables from convex

  const apiKey = process.env.KIE_API_KEY;
  const convexSiteUrl = process.env.CONVEX_SITE_URL;

  //build callback urls

  const callBackUrl = `${convexSiteUrl}/webhook/kie-video`;

  // Validate required environment variables
  if (!apiKey) {
    throw new Error(
      'KIE_API_KEY is not set in environment variables'
    );
  }
  if (!convexSiteUrl) {
    throw new Error(
      'CONVEX_SITE_URL is not set in environment variables'
    );
  }

  const requestBody = {
    model: trimmedModel,
    prompt,
    imageUrls: imageUrls,
    aspectRatio,
    callBackUrl,
    generationType: 'REFERENCE_2_VIDEO',
  };

  console.log('Calling KIE API with:', {
    model: trimmedModel,
    prompt: prompt.substring(0, 50) + '...',
    imageUrlsCount: imageUrls.length,
    aspectRatio,
  });

  //call Kie.ai API

  const response = await fetch(
    'https://api.kie.ai/api/v1/veo/generate',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      'Failed to create image with Kie:',
      `Status: ${response.status}`,
      `StatusText: ${response.statusText}`,
      `Error: ${errorText}`
    );
    throw new Error(
      `Failed to create image with Kie: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const result: KieResponse = await response.json();

  if (result.code !== 200) {
    console.error('Failed to create image with Kie:', result.message);
    throw new Error(
      `Failed to create image with Kie: ${result.message}`
    );
  }

  return result.data.taskId;
}
