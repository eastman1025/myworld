async function askAI() {
    const input = document.getElementById('chat-input');
    const content = document.getElementById('chat-content');
    const question = input.value;
    if (!question) return;

    content.innerHTML += `<div class="message user"><strong>나:</strong> ${question}</div>`;
    input.value = '';
    content.scrollTop = content.scrollHeight;

    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            body: JSON.stringify({
                model: 'llama3.2',
                prompt: question,
                stream: false
            })
        });
        const data = await response.json();
        content.innerHTML += `<div class="message ai"><strong>AI:</strong> ${data.response}</div>`;
        content.scrollTop = content.scrollHeight;
    } catch (error) {
        content.innerHTML += `<div class="message error" style="color:red;">오류: Ollama 서버가 켜져 있는지 확인하세요.</div>`;
    }
}

document.getElementById('send-btn').onclick = askAI;
document.getElementById('chat-input').onkeypress = (e) => { if(e.key === 'Enter') askAI(); };