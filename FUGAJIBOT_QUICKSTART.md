# FugajiBot Quick Start Guide

## 🚨 Current Status
The OpenAI package is installing (slow network). Once complete, follow these steps:

## ✅ Step-by-Step Setup

### 1. Wait for OpenAI Installation to Complete
The command `pip install openai` is currently running. Wait for it to finish.

### 2. Add OpenAI API Key
Create or edit `backend/.env`:

```bash
# Add these lines
OPENAI_API_KEY=sk-proj-your-actual-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

**Get your API key from:** https://platform.openai.com/api-keys

### 3. Run Database Migrations
```bash
cd backend
source .venv/bin/activate
python manage.py makemigrations ai
python manage.py migrate
```

### 4. Restart Django Server
```bash
python manage.py runserver
```

### 5. Test the Chatbot
1. Open browser: http://localhost:5173 (or your frontend URL)
2. Login as a farmer
3. Look for the floating blue chat button (bottom-right corner)
4. Click it and try these queries:

**Swahili Test:**
```
Habari! Niambie kuhusu shamba langu
```

**English Test:**
```
How many chickens do I have?
```

**Disease Query (Swahili):**
```
Kuku wangu wana harara, nifanye nini?
```

## 🎯 What FugajiBot Can Do

### Farm-Specific Queries
- "Niambie kuhusu makundi yangu" (Tell me about my batches)
- "Je, nina tahadhari zozote?" (Do I have any alerts?)
- "Kuku wangu ni wangapi?" (How many chickens do I have?)

### General Farming Advice
- "Chakula cha kuku wa wiki 3 ni kiasi gani?" (Feed for 3-week-old chickens?)
- "Ni lini niweke chanjo ya Newcastle?" (When to vaccinate for Newcastle?)
- "Joto ni juu sana, nifanye nini?" (Temperature too high, what to do?)

### Disease Diagnosis
- "Kuku wangu wana harara" (My chickens have diarrhea)
- "Kuna alama za ugonjwa gani?" (What disease signs to look for?)
- "Dawa ya coccidiosis ni ipi?" (Medicine for coccidiosis?)

## 🔧 Troubleshooting

### Error: "ModuleNotFoundError: No module named 'openai'"
**Solution:** Wait for pip installation to complete, then restart server

### Error: "OpenAI API key not found"
**Solution:** Add `OPENAI_API_KEY` to `backend/.env`

### Error: "401 Unauthorized"
**Solution:** Check your OpenAI API key is valid and has credits

### Chatbot doesn't appear
**Solution:** 
1. Check browser console for errors
2. Ensure you're logged in
3. Clear browser cache and reload

### Responses are slow
**Solution:**
- Normal: 2-5 seconds for GPT-3.5-turbo
- Slow (>10s): Check OpenAI API status
- Consider switching to GPT-4 for better quality (but more expensive)

## 💰 Cost Monitoring

### Check Usage in Django Admin
1. Go to http://localhost:8000/admin/
2. Navigate to "AI" → "Chat messages"
3. See `tokens_used` column for each message

### Estimate Monthly Costs
```python
# Django shell
from apps.ai.models import ChatMessage
from django.db.models import Sum

# Total tokens this month
total_tokens = ChatMessage.objects.filter(
    created_at__month=12,
    role='assistant'
).aggregate(Sum('tokens_used'))['tokens_used__sum']

# Cost estimate (GPT-3.5-turbo: $0.002 per 1K tokens)
estimated_cost = (total_tokens / 1000) * 0.002
print(f"Estimated cost: ${estimated_cost:.2f}")
```

## 🎨 Customization

### Change Welcome Message
Edit `src/components/FugajiBot.tsx` line 28:
```tsx
content: language === 'sw' 
  ? 'Your custom Swahili welcome message here!'
  : 'Your custom English welcome message here!',
```

### Add More Farm Context
Edit `backend/apps/ai/services.py` → `get_farm_context()`:
```python
# Add environmental data
context['temperature'] = get_latest_sensor_reading('temperature')
context['humidity'] = get_latest_sensor_reading('humidity')
```

### Modify System Prompt
Edit `backend/apps/ai/services.py` → `build_system_prompt()`:
```python
# Add more guidelines, examples, or personality
```

## 📊 Features Implemented

✅ Bilingual support (Swahili/English)
✅ Farm context injection (batches, alerts)
✅ Conversation history
✅ Suggested follow-up questions
✅ Typing indicators
✅ Mobile-responsive UI
✅ Language toggle mid-conversation
✅ Error handling with fallbacks

## 🚀 Next Enhancements (Future)

- [ ] Voice input (Web Speech API)
- [ ] Image upload for disease diagnosis
- [ ] WhatsApp integration
- [ ] Automated daily farm reports
- [ ] Voice output (text-to-speech)
- [ ] Offline mode with local LLM

## 📞 Support

If you encounter issues:
1. Check `FUGAJIBOT_SETUP.md` for detailed docs
2. Review Django logs: `backend/logs/`
3. Check browser console for frontend errors
4. Verify OpenAI API status: https://status.openai.com/

---

**Remember:** FugajiBot is powered by AI and may occasionally provide incorrect information. Always verify critical farming decisions with a veterinarian or agricultural expert.
