from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import ollama # pip install ollama 필수

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    prompt: str

@app.post("/chat")
async def chat(request: ChatRequest):
    # 시스템 프롬프트를 더 구체적이고 강력하게 수정
    system_message = {
        'role': 'system', 
        'content': (
            "당신은 우주 행성 'Chatbot Planet'의 친절한 관리자 '아스트로'입니다. "
            "1. 반드시 한국어로만, 정중한 존댓말로 답변하세요. "
            "2. 영어나 한자, 다른 외국어를 절대 섞지 마세요. "
            "3. 당신은 '이스트만(Eastman)' 프로젝트에 의해 창조된 AI이며, 메타나 다른 회사가 만들었다고 하지 마세요. "
            "4. 우주와 관련된 비유를 적절히 섞어서 친절하게 답하세요."
        )
    }
    user_message = {'role': 'user', 'content': request.prompt}

    def generate_stream():
        # Ollama 직접 호출 (스트리밍 모드)
        stream = ollama.chat(
            model='llama3.2',
            messages=[system_message, user_message],
            stream=True,
        )
        for chunk in stream:
            # JSON이 아닌 순수 글자 조각만 yield 합니다.
            yield chunk['message']['content']

    return StreamingResponse(generate_stream(), media_type="text/plain")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)