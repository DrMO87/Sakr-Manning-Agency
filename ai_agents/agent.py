# ai_agents/agent.py
# from langchain.agents import initialize_agent
# from langchain_ollama import OllamaLLM
# from .tools import tools

# llm = OllamaLLM(model="gemma3:1b")  # You can swap with another local Ollama model

# agent = initialize_agent(
#     tools=tools,
#     llm=llm,
#     agent="zero-shot-react-description",
#     verbose=True,
#     handle_parsing_errors=True,
# )

# ai_agents/agent.py
from langgraph.prebuilt import create_react_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from .tools import tools
import os

# Default Gemini configuration
def get_model(groq_api_key=None):
    if not groq_api_key:
        groq_api_key = os.environ.get("GROQ_API_KEY")
        
    if groq_api_key:
        try:
            from langchain_groq import ChatGroq
            return ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=groq_api_key)
        except ImportError:
            pass
            
    google_api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY", "missing_key_please_add_to_env")
    return ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite", google_api_key=google_api_key)

# System prompt for the chat agent
SYSTEM_PROMPT = """You are a conversational AI Search Agent designed to help users find information through natural dialogue.

Your personality and approach:
- Friendly, helpful, and conversational
- Remember context from previous messages in the conversation
- Ask clarifying questions when needed
- Provide comprehensive but digestible answers
- Suggest follow-up topics or related questions
- Acknowledge when you don't know something and search for it

Your search capabilities:
- WebSearch: Real-time web search for current information
- WikipediaSearch: Encyclopedia knowledge for background information  
- ConversationalSearch: Context-aware search for follow-up questions
- NewsSearch: Recent news and current events
- ResearchSearch: Academic and detailed information
- FactCheck: Verify claims and statements
- FollowUpQuestions: Generate relevant conversation continuations

Chat guidelines:
1. Always maintain conversation context and refer back to previous messages when relevant
2. Use the most appropriate search tool based on the user's question and conversation history
3. For follow-up questions, use ConversationalSearch to maintain topic continuity
4. Provide sources and citations when possible
5. If information seems outdated or uncertain, mention this and search for updates
6. End responses with relevant follow-up questions or suggestions when appropriate
7. Be concise but thorough - aim for helpful, not overwhelming responses
8. Remember user preferences and interests shown throughout the conversation

Always be helpful, accurate, and engaging in your responses!"""

# We create the agent dynamically now
# agent = create_react_agent(model, tools)

def format_conversation_history(messages):
    """Format conversation history for the agent"""
    formatted_messages = []
    
    # Add system message first
    formatted_messages.append(SystemMessage(content=SYSTEM_PROMPT))
    
    for message in messages:
        if hasattr(message, 'role') and hasattr(message, 'content'):
            if message.role == 'user':
                formatted_messages.append(HumanMessage(content=message.content))
            elif message.role == 'assistant':
                formatted_messages.append(AIMessage(content=message.content))
        elif hasattr(message, 'message_type') and hasattr(message, 'content'):
            if message.message_type == 'user':
                formatted_messages.append(HumanMessage(content=message.content))
            elif message.message_type == 'assistant':
                formatted_messages.append(AIMessage(content=message.content))
    
    return formatted_messages

def extract_conversation_context(messages, limit=5):
    """Extract recent conversation context"""
    if not messages:
        return ""
    
    recent_messages = list(messages.order_by('-timestamp')[:limit])
    context_parts = []
    
    for message in reversed(recent_messages):
        role = "User" if message.role == 'user' else "Assistant"
        content = message.content[:100] + "..." if len(message.content) > 100 else message.content
        context_parts.append(f"{role}: {content}")
    
    return "\n".join(context_parts)

def get_agent_response(query, conversation_history=None, session_id=None, api_keys_config=None, groq_api_key=None):
    """Get response from the agent with conversation context"""
    try:
        # Determine which key to use
        # If api_keys_config has groq keys, extract one (simplified for chat)
        if api_keys_config and isinstance(api_keys_config, dict) and api_keys_config.get("groq"):
            for k in api_keys_config.get("groq", []):
                if k.get("status") == "live" and k.get("key"):
                    groq_api_key = k["key"]
                    break

        # Create dynamic agent
        model = get_model(groq_api_key)
        agent = create_react_agent(model, tools)
        
        # Prepare messages
        messages = []
        
        # Add system message
        messages.append(SystemMessage(content=SYSTEM_PROMPT))
        
        # Add conversation history if available
        if conversation_history:
            for msg in conversation_history:
                if msg.role == 'user':
                    messages.append(HumanMessage(content=msg.content))
                elif msg.role == 'assistant':
                    messages.append(AIMessage(content=msg.content))
        
        # Add current query
        messages.append(HumanMessage(content=query))
        
        # Get response from agent
        response = agent.invoke({"messages": messages})
        
        # Extract token usage and update api_keys_config
        if api_keys_config and isinstance(api_keys_config, dict):
            try:
                total_tokens = 0
                for msg in response.get("messages", []):
                    if hasattr(msg, 'response_metadata') and msg.response_metadata:
                        usage = msg.response_metadata.get("token_usage", {})
                        if isinstance(usage, dict):
                            total_tokens += usage.get("total_tokens", 0)
                        elif hasattr(usage, 'total_tokens'):
                            total_tokens += usage.total_tokens
                if total_tokens > 0:
                    provider = "groq" if groq_api_key else "gemini"
                    token_key = f"{provider}_tokens"
                    api_keys_config[token_key] = api_keys_config.get(token_key, 0) + total_tokens
            except Exception as e:
                print(f"Token tracking error: {e}")

        # Extract the final message content
        if response and "messages" in response:
            final_message = response["messages"][-1]
            if hasattr(final_message, 'content'):
                return final_message.content, api_keys_config
            else:
                return str(final_message), api_keys_config
        
        return "I apologize, but I couldn't generate a proper response. Please try again.", api_keys_config
        
    except Exception as e:
        return f"I encountered an error while processing your request: {str(e)}", api_keys_config