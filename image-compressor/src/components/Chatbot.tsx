import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios'; // Jscbc: 仅导入 axios 默认导出
import knowledge from '../../../knowledge.json'; // 导入知识库文件

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Jscbc: Deepseek API 响应数据接口
interface DeepseekChatCompletionResponse {
  choices: Array<{
    message: {
      role: 'assistant';
      content: string;
    };
  }>;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const DEEPSEEK_API_KEY = 'sk-c5d08491631f49b6a728c4fce9219e5c'; // 请注意：在生产环境中，API 密钥应通过环境变量安全管理。

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newMessages: Message[] = [...messages, { role: 'user', content: inputMessage }];
    setMessages(newMessages);
    setInputMessage('');

    // 首先尝试从本地知识库中获取答案
    const knowledgeAnswer = getAnswerFromKnowledgeBase(inputMessage);
    if (knowledgeAnswer) {
      setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: knowledgeAnswer }]);
      return;
    }

    try {
      const response = await axios.post<DeepseekChatCompletionResponse>(
        'https://api.deepseek.com/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            ...newMessages,
          ],
          stream: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          },
        }
      );

      const assistantMessage = response.data.choices[0].message.content;
      setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: assistantMessage }]);
    } catch (error: unknown) { // Jscbc: 将 error 类型明确声明为 unknown
      console.error('Error fetching from Deepseek API:', error);
      // Jscbc: 检查 error 是否为 Axios 错误，并记录详细信息
      if (typeof error === 'object' && error !== null && 'response' in error) {
        console.error('Axios error response:', (error as any).response);
        console.error('Axios error request:', (error as any).request);
        console.error('Axios error config:', (error as any).config);
      } else if (error instanceof Error) {
        console.error('General error message:', error.message);
      } else {
        console.error('An unexpected error occurred:', error);
      }
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: '对不起，我无法连接到Deepseek API。' },
      ]);
    }
  };

  // Jscbc: 根据用户输入从知识库中获取答案
  const getAnswerFromKnowledgeBase = (query: string): string | null => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('项目名称') || lowerQuery.includes('项目叫什么')) {
      return `本项目名为：${knowledge.project_name}。`;
    }
    if (lowerQuery.includes('项目简介') || lowerQuery.includes('介绍一下项目')) {
      return `项目简介：${knowledge.project_description}。`;
    }
    if (lowerQuery.includes('核心功能') || lowerQuery.includes('功能有哪些') || lowerQuery.includes('支持什么')) {
      return `本项目支持以下核心功能：\\n${knowledge.core_features.map((f: string) => `- ${f}`).join('\\n')}。`;
    }
    if (lowerQuery.includes('技术栈') || lowerQuery.includes('用了什么技术') || lowerQuery.includes('技术架构')) {
      return `前端技术栈：\\n${knowledge.technology_stack.frontend.map((t: string) => `- ${t}`).join('\\n')}\\n\\n后端技术栈：\\n${knowledge.technology_stack.backend.map((t: string) => `- ${t}`).join('\\n')}。`;
    }
    if (lowerQuery.includes('目录结构') || lowerQuery.includes('文件结构')) {
      return `项目目录结构如下：\\n${knowledge.directory_structure.map((d: string) => `- ${d}`).join('\\n')}。`;
    }
    if (lowerQuery.includes('本地启动') || lowerQuery.includes('怎么运行')) {
      const backendCmds = knowledge.quick_start.backend.commands.join('\\n');
      const frontendCmds = knowledge.quick_start.frontend.commands.join('\\n');
      return `要本地启动项目，请按照以下步骤操作：\\n\\n后端（NestJS）：\\n\`\`\`bash\\n${backendCmds}\\n\`\`\`\\n默认监听 3000 端口。\\n\\n前端（React/Vite）：\\n\`\`\`bash\\n${frontendCmds}\\n\`\`\`\\n默认监听 3001 端口。\\n\\n访问前端：${knowledge.quick_start.access_frontend}。`;
    }
    if (lowerQuery.includes('环境变量') || lowerQuery.includes('env配置')) {
      const frontendEnv = knowledge.environment_variables.frontend.VITE_API_BASE_URL;
      const backendNotes = knowledge.environment_variables.backend.notes.join('\\n');
      return `环境变量说明：\\n\\n前端：\\n\`VITE_API_BASE_URL\`：${frontendEnv.description}\\n本地开发：${frontendEnv.local_development}\\n生产部署示例：${frontendEnv.production_deployment_example}\\n\\n后端：\\n${backendNotes}。`;
    }
    if (lowerQuery.includes('render部署') || lowerQuery.includes('云端部署') || lowerQuery.includes('render一键部署')) {
      const frontendSteps = knowledge.render_deployment.frontend.steps.join('\\n');
      const backendSteps = knowledge.render_deployment.backend.steps.join('\\n');
      return `Render 云端部署步骤：\\n\\n前端：\\n${frontendSteps}\\n\\n后端：\\n${backendSteps}。`;
    }
    if (lowerQuery.includes('相关链接') || lowerQuery.includes('更多信息')) {
      return `以下是一些相关链接：\\n${knowledge.related_links.map((link: string) => `- ${link}`).join('\\n')}。`;
    }
    if (lowerQuery.includes('许可证') || lowerQuery.includes('license')) {
      return `本项目采用 ${knowledge.license} 许可证。`;
    }

    return null; // 如果没有匹配到知识库内容，返回 null
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-lg w-80 h-96 flex flex-col">
          <div className="p-4 bg-blue-500 text-white rounded-t-lg flex justify-between items-center">
            <h3 className="text-lg font-semibold">智能客服</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
              &times;
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span
                  className={`inline-block p-2 rounded-lg ${
                    msg.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-gray-200 flex">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg p-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入消息..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              发送
            </button>
          </div>
        </div>
      )}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Chatbot; 