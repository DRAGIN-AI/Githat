// ai-worker.js - Web Worker for AI computations
importScripts('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');

const { pipeline, env } = self;

// Configure Transformers.js
env.allowLocalModels = false;

let summarizer = null;
let questionAnswerer = null;
let featureExtractor = null;

let currentSummarizationModel = 'Xenova/distilbart-cnn-6-6';
let currentQAModel = 'Xenova/distilbert-base-cased-distilled-squad';

// Handle messages from main thread
self.onmessage = async function(e) {
    const { type, data } = e.data;
    
    try {
        switch(type) {
            case 'INIT_MODELS':
                await initModels(data);
                break;
            case 'SUMMARIZE':
                await summarizeText(data);
                break;
            case 'GENERATE_EMBEDDING':
                await generateEmbedding(data);
                break;
            case 'ANSWER_QUESTION':
                await answerQuestion(data);
                break;
            case 'SWITCH_SUMMARIZATION_MODEL':
                await switchSummarizationModel(data);
                break;
            case 'SWITCH_QA_MODEL':
                await switchQAModel(data);
                break;
            default:
                self.postMessage({ type: 'ERROR', error: 'Unknown message type' });
        }
    } catch (error) {
        self.postMessage({ 
            type: 'ERROR', 
            error: error.message,
            stack: error.stack
        });
    }
};

async function initModels(data) {
    try {
        if (data.summarizationModel) {
            currentSummarizationModel = data.summarizationModel;
        }
        if (data.qaModel) {
            currentQAModel = data.qaModel;
        }
        
        self.postMessage({ type: 'INIT_PROGRESS', message: 'Loading summarization model...' });
        summarizer = await pipeline('summarization', currentSummarizationModel);
        
        self.postMessage({ type: 'INIT_PROGRESS', message: 'Loading Q&A model...' });
        questionAnswerer = await pipeline('question-answering', currentQAModel);
        
        self.postMessage({ type: 'INIT_PROGRESS', message: 'Loading embedding model...' });
        featureExtractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        
        self.postMessage({ 
            type: 'INIT_COMPLETE',
            models: {
                summarization: currentSummarizationModel,
                qa: currentQAModel
            }
        });
    } catch (error) {
        self.postMessage({ type: 'ERROR', error: error.message });
    }
}

async function summarizeText(data) {
    try {
        const { text } = data;
        
        self.postMessage({ type: 'SUMMARIZE_PROGRESS', message: 'Generating summary...' });
        
        const result = await summarizer(text, {
            max_new_tokens: 512,
            min_length: 30,
            do_sample: false
        });
        
        const summary = result[0].summary_text;
        
        self.postMessage({ 
            type: 'SUMMARIZE_COMPLETE',
            summary: summary
        });
    } catch (error) {
        self.postMessage({ type: 'ERROR', error: error.message });
    }
}

async function generateEmbedding(data) {
    try {
        const { text } = data;
        
        self.postMessage({ type: 'EMBEDDING_PROGRESS', message: 'Generating embedding...' });
        
        const embeddingResult = await featureExtractor(text, { 
            pooling: 'mean', 
            normalize: true 
        });
        
        const embedding = Array.from(embeddingResult.data);
        
        self.postMessage({ 
            type: 'EMBEDDING_COMPLETE',
            embedding: embedding
        });
    } catch (error) {
        self.postMessage({ type: 'ERROR', error: error.message });
    }
}

async function answerQuestion(data) {
    try {
        const { query, context } = data;
        
        self.postMessage({ type: 'QA_PROGRESS', message: 'Generating answer...' });
        
        const qaResult = await questionAnswerer(query, context);
        
        self.postMessage({ 
            type: 'QA_COMPLETE',
            answer: qaResult.answer
        });
    } catch (error) {
        self.postMessage({ type: 'ERROR', error: error.message });
    }
}

async function switchSummarizationModel(data) {
    try {
        const { model } = data;
        currentSummarizationModel = model;
        
        self.postMessage({ type: 'MODEL_SWITCH_PROGRESS', message: 'Loading new summarization model...' });
        
        summarizer = await pipeline('summarization', currentSummarizationModel);
        
        self.postMessage({ 
            type: 'MODEL_SWITCH_COMPLETE',
            modelType: 'summarization',
            model: currentSummarizationModel
        });
    } catch (error) {
        self.postMessage({ type: 'ERROR', error: error.message });
    }
}

async function switchQAModel(data) {
    try {
        const { model } = data;
        currentQAModel = model;
        
        self.postMessage({ type: 'MODEL_SWITCH_PROGRESS', message: 'Loading new Q&A model...' });
        
        questionAnswerer = await pipeline('question-answering', currentQAModel);
        
        self.postMessage({ 
            type: 'MODEL_SWITCH_COMPLETE',
            modelType: 'qa',
            model: currentQAModel
        });
    } catch (error) {
        self.postMessage({ type: 'ERROR', error: error.message });
    }
}
