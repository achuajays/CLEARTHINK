# 🧠 CLEARTHINK

<div align="center">

![CLEARTHINK Banner](static/banner.png)

**Multi-Agent Decision Making System**

*Think clearly, decide wisely.*

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-121212?style=for-the-badge&logo=chainlink&logoColor=white)](https://langchain.com/)
[![Groq](https://img.shields.io/badge/Groq-FF6B35?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)

</div>

---

CLEARTHINK uses 6 specialized AI agents to help you make better decisions by analyzing problems from multiple perspectives.

## 🏗️ Architecture

```mermaid
flowchart TB
    subgraph Input["🎯 User Input"]
        UI[Web Interface]
        API[REST API]
    end

    subgraph Orchestrator["🎛️ CLEARTHINK Orchestrator"]
        direction TB
        A1["1️⃣ Problem Framing Agent<br/>🎯 Clarifies the decision"]
        A2["2️⃣ Option Generator Agent<br/>💡 Creates realistic options"]
        A3["3️⃣ Assumption Detector Agent<br/>🔍 Finds hidden assumptions"]
        A4["4️⃣ Second-Order Thinking Agent<br/>🔮 Explores consequences"]
        A5["5️⃣ Bias Detection Agent<br/>🧠 Identifies cognitive biases"]
        A6["6️⃣ Decision Summary Agent<br/>✅ Final recommendation"]
        
        A1 --> A2 --> A3 --> A4 --> A5 --> A6
    end

    subgraph LLM["🤖 LLM Backend"]
        Groq["Groq API<br/>llama-3.3-70b"]
    end

    subgraph Output["📊 Results"]
        Result["Comprehensive Analysis<br/>+ Confidence Level<br/>+ First Action Step"]
    end

    UI --> Orchestrator
    API --> Orchestrator
    A1 <-.-> Groq
    A2 <-.-> Groq
    A3 <-.-> Groq
    A4 <-.-> Groq
    A5 <-.-> Groq
    A6 <-.-> Groq
    A6 --> Result

    style A1 fill:#1D6A6A,color:#fff
    style A2 fill:#D4A853,color:#fff
    style A3 fill:#7B6B8D,color:#fff
    style A4 fill:#1D6A6A,color:#fff
    style A5 fill:#D4A853,color:#fff
    style A6 fill:#7B6B8D,color:#fff
    style Groq fill:#FF6B35,color:#fff
```

## 🧩 How It Works

| # | Agent | What It Does |
|---|-------|--------------|
| 1️⃣ | **Problem Framing** | Transforms messy input into clear problem statements |
| 2️⃣ | **Option Generator** | Generates realistic options with honest trade-offs |
| 3️⃣ | **Assumption Detector** | Finds hidden assumptions (Facts, Beliefs, Fears) 🔥 |
| 4️⃣ | **Second-Order Thinking** | Explores "what happens next" scenarios |
| 5️⃣ | **Bias Detection** | Identifies cognitive biases gently |
| 6️⃣ | **Decision Summary** | Synthesizes recommendations with confidence levels |

## 🚀 Quick Start

```bash
# 1. Navigate to project
cd CLEARTHINK

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Set up environment variables
copy .env.example .env
# Edit .env and add your GROQ_API_KEY

# 6. Run the application
python main.py
```

The app will be available at: http://localhost:8000

## 💡 Example Use Cases

- 💼 Career decisions
- 🚀 Startup ideas
- 💰 Financial choices
- ❤️ Relationship decisions
- 📦 Product decisions

## 🎨 Design

Built with a **Neutral + Earth** color palette:
- Cream `#F5EBE0`
- Teal `#1D6A6A`
- Gold `#D4A853`
- Purple `#7B6B8D`

## 📁 Project Structure

```
CLEARTHINK/
├── app/
│   ├── agents/           # 6 specialized agents
│   │   ├── base.py
│   │   ├── problem_framing.py
│   │   ├── option_generator.py
│   │   ├── assumption_detector.py
│   │   ├── second_order_thinking.py
│   │   ├── bias_detection.py
│   │   ├── decision_summary.py
│   │   └── orchestrator.py
│   ├── main.py           # FastAPI application
│   └── config.py
├── static/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── main.py               # Entry point
├── requirements.txt
└── .env.example
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Serve UI |
| GET | `/health` | Health check |
| POST | `/api/analyze` | Analyze a decision |
| GET | `/docs` | API documentation |

## 📝 License

MIT
