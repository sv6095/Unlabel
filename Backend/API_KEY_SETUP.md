# API Key Configuration & Quota Management

## Problem: Quota Exceeded Error

If you're seeing this error:
```
429 You exceeded your current quota, please check your plan and billing details.
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests
Limit: 20 requests/day for gemini-2.5-flash (Free Tier)
```

This means you've hit the daily quota limit for the Gemini API free tier.

## Solution: Multi-Key Fallback System

We've implemented an automatic API key rotation system. When one key hits its quota, the system automatically switches to the next available key.

### How to Add Multiple API Keys

#### Option 1: Environment Variables (Production - Render/Vercel)

Add these environment variables in your hosting platform:

```bash
GEMINI_API_KEY=your-first-key-here
GEMINI_API_KEY1=your-first-key-here   # Same as above
GEMINI_API_KEY2=your-second-key-here
GEMINI_API_KEY3=your-third-key-here
GEMINI_API_KEY4=your-fourth-key-here
# ... up to GEMINI_API_KEY10
```

**Note**: You can use the same key for both `GEMINI_API_KEY` and `GEMINI_API_KEY1`. The system will deduplicate them.

#### Option 2: .env File (Local Development)

Create a `.env` file in the `Backend` directory:

```bash
# Backend/.env
GEMINI_API_KEY=your-primary-gemini-api-key-here

# Additional fallback keys (optional but recommended)
GEMINI_API_KEY1=your-first-gemini-api-key
GEMINI_API_KEY2=your-second-gemini-api-key
GEMINI_API_KEY3=your-third-gemini-api-key
# ... etc
```

### How to Get Multiple API Keys

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create multiple API keys
3. Each key gets its own quota (20 requests/day for free tier)
4. Add them to your environment variables

### How It Works

1. **Automatic Rotation**: When a key hits its quota, the system automatically tries the next key
2. **Cooldown Period**: Failed keys get a 60-second cooldown before retry
3. **Logging**: You'll see messages like:
   ```
   ✅ Succeeded with API Key #3 after 2 fallback(s)
   ```
4. **All Services**: The fallback system is used by:
   - `ai_service` (FoodReasoningEngine)
   - `autonomous_agent` (AutonomousAgent)
   - `comparison_service` (ComparisonService)

### Monitoring Usage

- **Check Current Stats**: The key_manager tracks which keys are working
- **View Logs**: Backend logs show which key is being used for each request
- **Monitor Usage**: Visit [Google AI Studio Usage](https://ai.dev/usage?tab=rate-limit)

### Quota Limits (Free Tier)

| Model | Requests/Day | Requests/Minute |
|-------|--------------|-----------------|
| gemini-2.5-flash | 20 | 15 |
| gemini-1.5-pro | 50 | 2 |
| gemini-1.5-flash | 1500 | 15 |

**Tip**: With 5 API keys, you effectively get **100 requests/day** (5 × 20).

### Upgrading to Paid Tier

For production use with higher quotas:
1. Enable billing in Google Cloud Console
2. Quotas increase dramatically (e.g., 1000+ requests/minute)
3. Keep the multi-key system for redundancy, not just quota

## Testing

After adding multiple keys, restart your backend and you should see:

```
✅ Loaded 5 Gemini API key(s) for fallback rotation
📍 Environment: production
✅ FoodReasoningEngine initialized with key_manager (multi-key fallback enabled)
✅ ComparisonService initialized with key_manager (multi-key fallback enabled)
```

## Troubleshooting

**"All X API key(s) failed"**
- All your keys have hit their quota
- Wait until quota reset (usually midnight PT)
- Or add more keys

**"Autonomous agent not initialized"**
- No API keys found in environment
- Check your .env file or environment variables
- Make sure at least one GEMINI_API_KEY is set
