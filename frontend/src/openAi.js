import {openAi} from 'openai';

const openAi = new openAi({
    apiKey: ''
});

const generateRandomImage = async (prompt = 'A random image', width = 500, height = 500) => {
    try {
        const response = await openAi.createImage({
            prompt,
            n: 1,
            size: `${width}x${height}`,
        });
        return response.data;
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
};
export {generateRandomImage};