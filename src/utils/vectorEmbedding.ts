import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

export const pincona = new Pinecone({apiKey : process.env.PINECONE_API_KEY as string});
export const openai = new OpenAI({apiKey : process.env.OPENAI_API_KEY as string});
export const index = pincona.index("text");

//Use openai model for generate the vector embedding 
export const generateEmbedding = async(text : string) => {
     const response = await openai.embeddings.create({
         model : "text-embedding-ada-002",
         input : text
     })
     return response.data[0].embedding
}

//Create an index for vectors created with an external embedding model and add it to the index.
export const addTodo = async(text:string , _id : string) => {
     try {
         const todoId = Date.now().toString();
         const embedding = await generateEmbedding(text);
         const metadata = {
             text,
             userId : _id,
         };

         await index.upsert([
            {id : todoId , values: embedding,metadata},
         ]);

         return { id : todoId , ...metadata};
     }catch(error){
        console.error("Error adding todo:", error);
        throw error;
     }
}


const searchSimilarTodos = async(query : string , userId : string ,topK = 2 ) => {
     try {
        const queryEmbedding = await generateEmbedding(query);
        const result = await index.query({
             vector: queryEmbedding,
             topK,
             includeMetadata : true
        })

        const responses = result.matches.filter((match) => (
               match.metadata?.userId === userId
        ))

        const response = responses.map((match)=> ({
             id : match.id,
             text : match.metadata?.text,
        }))
        return response;

     }catch(error){
         console.error("Error deleting todo: ",error);
         throw error;
     }
}

export const getChatGptResponse = async(query : string , userId : string) => {
     try{
         const similarTodos = await searchSimilarTodos(query, userId);

         let prompt ; 
         if(similarTodos.length == 0){
            prompt = `User query about their todos: '${query}'. No related todos found. Please provide a helpful response.`;
         } else {
             const todosList = similarTodos.map((todo,i) =>{
                 return `${i+1}. ${todo.text}`
             })
             .join("\n");

             prompt = `User query about their texts : ${query} , Most relavent texts found in their list is ${todosList} Based on these relavant texts , provide a helpful response to the user query.`; 
         }
         const response = await openai.chat.completions.create({
             model : "gpt-3.5-turbo",
             messages : [
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
     }catch(error){
        console.error("Error getting chatgpt response: ",error);
        throw error;
     }
}