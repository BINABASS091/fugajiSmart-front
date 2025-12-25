# FugajiBot AI Assistant - Setup Guide

## 🎯 What We Built

A complete Swahili-first AI chatbot for poultry farmers with:
- **Backend**: Django + OpenAI GPT integration
- **Frontend**: Beautiful React chat widget
- **Features**: 
  - Bilingual support (Swahili/English)
  - Farm context injection (batches, alerts, etc.)
  - Conversation history
  - Suggested questions
  - Real-time responses

## 📦 Installation Steps

### 1. Install OpenAI Package
```bash
cd backend
source .venv/bin/activate
pip install openai
```

### 2. Add OpenAI API Key
Create/update `backend/.env`:
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo  # or gpt-4 for better quality
```

### 3. Run Migrations
```bash
python manage.py makemigrations ai
python manage.py migrate
```

### 4. Restart Django Server
```bash
python manage.py runserver
```

## 🧪 Testing the Chatbot

### Test in Browser
1. Navigate to any farmer dashboard page
2. Look for the floating blue chat button (bottom-right)
3. Click to open FugajiBot
4. Try these test queries:

**Swahili:**
- "Habari! Niambie kuhusu shamba langu"
- "Kuku wangu wana harara, nifanye nini?"
- "Chakula cha kuku wa wiki 3 ni kiasi gani?"

**English:**
- "Tell me about my farm status"
- "My chickens have diarrhea, what should I do?"
- "How much feed for 3-week-old broilers?"

### Test API Directly
```bash
curl -X POST http://localhost:8000/api/v1/ai/chat/ \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -d '{
    "message": "Je, kuku wangu wana afya?",
    "language": "sw"
  }'
```

## 🎨 UI Features

- **Floating Button**: Pulsing green dot indicates online status
- **Language Toggle**: Switch between Swahili/English mid-conversation
- **Message Bubbles**: User (blue) vs Bot (white with avatar)
- **Typing Indicator**: Shows "Inafikiri..." while AI generates response
- **Suggested Questions**: Quick-tap follow-up questions
- **Auto-scroll**: Messages scroll to bottom automatically

## 💰 Cost Management

### OpenAI Pricing (as of 2024)
- **GPT-3.5-turbo**: ~$0.002 per message
- **GPT-4**: ~$0.03 per message

### Expected Usage
- 50 messages/farmer/month
- 100 farmers = $10/month (GPT-3.5) or $150/month (GPT-4)

### Cost Optimization Tips
1. Use GPT-3.5-turbo for most queries
2. Implement rate limiting (max 20 messages/hour/user)
3. Cache common questions
4. Add message length limits

## 🔧 Customization

### Change System Prompt
Edit `backend/apps/ai/services.py` → `build_system_prompt()`

### Add More Context
Edit `backend/apps/ai/services.py` → `get_farm_context()`

Example: Add environmental data
```python
context['temperature'] = get_latest_temperature(profile)
context['humidity'] = get_latest_humidity(profile)
```

### Modify UI Colors
Edit `src/components/FugajiBot.tsx`:
- Line 126: Floating button color
- Line 152: Header gradient
- Line 192: Message bubble colors

## 🚀 Next Steps

### Phase 1: Basic Improvements
- [ ] Add voice input (Web Speech API)
- [ ] Add message reactions (👍👎)
- [ ] Add "Copy message" button
- [ ] Add chat export (PDF/CSV)

### Phase 2: Advanced Features
- [ ] Integrate with WhatsApp Business API
- [ ] Add image upload for disease diagnosis
- [ ] Add automated daily farm reports
- [ ] Add voice output (text-to-speech)

### Phase 3: Analytics
- [ ] Track most common questions
- [ ] Measure response satisfaction
- [ ] A/B test different prompts
- [ ] Monitor API costs per user

## 📊 Monitoring

### Check Chat Usage
```python
# Django shell
from apps.ai.models import ChatSession, ChatMessage

# Total sessions
ChatSession.objects.count()

# Messages today
from django.utils import timezone
ChatMessage.objects.filter(created_at__date=timezone.now().date()).count()

# Most active users
ChatSession.objects.values('user__email').annotate(
    total_messages=Count('messages')
).order_by('-total_messages')[:10]
```

### Check Costs
```python
# Total tokens used this month
from django.db.models import Sum
ChatMessage.objects.filter(
    created_at__month=timezone.now().month,
    role='assistant'
).aggregate(Sum('tokens_used'))
```

## ⚠️ Important Notes

1. **API Key Security**: Never commit `.env` to Git
2. **Rate Limiting**: Implement to prevent abuse
3. **Error Handling**: Bot has fallback responses if OpenAI fails
4. **Offline Mode**: Currently requires internet (future: local LLM)
5. **Data Privacy**: Chat logs stored in database (GDPR compliance needed)

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'openai'"
```bash
pip install openai
```

### "OpenAI API key not found"
Check `backend/.env` has `OPENAI_API_KEY=sk-...`

### "401 Unauthorized" when testing
Ensure you're logged in (cookies set)

### Bot responds in wrong language
Click the language toggle button (🌐 icon)

### Slow responses
- Check OpenAI API status
- Consider switching to GPT-3.5-turbo
- Reduce `max_tokens` in `services.py`

## 📝 Files Created

**Backend:**
- `backend/apps/ai/models.py` - ChatSession, ChatMessage, FecalImageAnalysis
- `backend/apps/ai/serializers.py` - API serializers
- `backend/apps/ai/services.py` - OpenAI integration
- `backend/apps/ai/views.py` - API endpoints
- `backend/apps/ai/urls.py` - URL routing
- `backend/apps/ai/admin.py` - Django admin

**Frontend:**
- `src/components/FugajiBot.tsx` - Chat widget UI

**Config:**
- Updated `backend/config/settings.py` - Added 'apps.ai'
- Updated `backend/config/urls.py` - Added AI routes
- Updated `src/components/DashboardLayout.tsx` - Added FugajiBot

## 🎉 Success Criteria

✅ Chatbot appears on all farmer pages
✅ Responds in Swahili by default
✅ Injects farm context (batches, alerts)
✅ Conversation history persists
✅ Language toggle works
✅ Mobile-responsive design
✅ Graceful error handling

---

**Built with ❤️ for Tanzanian poultry farmers**
