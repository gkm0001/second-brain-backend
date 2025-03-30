import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const INDEX_NAME = 'index';

// Initialize Pinecone and OpenAI clients with your API keys
export const pinecone = new Pinecone({ 
  apiKey: process.env.PINECONE_API_KEY as string
});
console.log(process.env.PINECONE_API_KEY as string);
console.log(process.env.OPENAI_API_KEY);


export const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

// Check if the index exists
export const indexExists = async () => {
    try {
      const description = await pinecone.describeIndex(INDEX_NAME );
      return !!description;
    } catch (error) {
      console.error("Error describing index:", error);
      return false;
    }
  };
  
  // Create a new database (index) in Pinecone. The text parameter is not used here.
  export const createDatabase = async () => {
    try {
      await pinecone.createIndex({
        name: INDEX_NAME,
        dimension: 1536, // Dimension for text-embedding-ada-002
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      console.log("Index created successfully.");
      return { status: 200 };
    } catch (error) {
      console.error("Error creating database:", error);
      return { status: 401 };
    }
  };
  
  // Retrieve the Pinecone index instance using the index name.
  // Ensure the index exists before retrieving it.
  const getPineconeIndex = async () => {
    if (!(await indexExists())) {
      console.log("Index does not exist. Creating index programmatically...");
      await createDatabase();
    }
    return pinecone.Index(INDEX_NAME);
  };
  
  // Use the OpenAI model to generate vector embeddings
  export const generateEmbedding = async (text: string) => {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    // console.log(response.data);
    // console.log(response.data[0])
    // console.log(response.data[0].embedding)
    
    return response.data[0].embedding;
  }
  
  // Add a todo item to the Pinecone index with associated userId
  export const addTodo = async (text: string, userId: string) => {
    try {
      const todoId = Date.now().toString();
      const embedding = await generateEmbedding(text);
      const metadata = { text, userId };
  
      const pineconeIndex = await getPineconeIndex();
      await pineconeIndex.namespace('ns1').upsert([
        { id: todoId, values: embedding, metadata },
      ]);
       console.log('text added successfully');
       
      return { status: 200, message: "Text added successfully" };
    } catch (error) {
      console.error("Error adding todo:", error);
      throw error;
    }
  };
  
  // Search for similar todos based on the query and userId
  export const searchSimilarTodos = async (query: string, userId: string, topK = 2) => {
    try {
       
      const queryEmbedding = await generateEmbedding(query);
      const pineconeIndex = await getPineconeIndex();

      const result = await pineconeIndex.namespace('ns1').query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
      });
      // Filter results to include only todos from the specific user
      const responses = result.matches.filter(match => match.metadata?.userId === userId);
      
      return responses.map(match => ({
        id: match.id,
        text: match.metadata?.text,
      }));
    } catch (error) {
      console.error("Error searching todos:", error);
      throw error;
    }
  };
  
  // Get a ChatGPT response based on the user's query and their todos
  export const getChatGptResponse = async (query: string, userId: string) => {
    try {
      console.log("userId",userId);
      
      const similarTodos = await searchSimilarTodos(query, userId);
      let prompt: string;
  
      if (similarTodos.length === 0) {
        console.log("Hii are you there");
        
        prompt = `User query about their todos: '${query}'. No related todos found. Please provide a helpful response.`;
      } else {
         console.log("Are you here");
         
        const todosList = similarTodos
          .map((todo, i) => `${i + 1}. ${todo.text}`)
          .join("\n");
        prompt = `User query about their texts: '${query}'. Most relevant texts found in their list are:\n${todosList}\nBased on these relevant texts, provide a helpful response to the user query.`;
      }
  
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant for a todo application. Your job is to help users understand their tasks and priorities based on their queries."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });
  
      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error getting ChatGPT response:", error);
      throw error;
    }
  };