"""
Autonomous AI Agent
Orchestrates multi-step analysis workflow autonomously
"""
import asyncio
from typing import Dict, List, Any, Optional
from enum import Enum
import google.generativeai as genai
from app.ai.key_manager import key_manager
from app.ai.schemas import DecisionEngineResponse, QuickInsight, ConsumerExplanation, IngredientTranslation
from app.ai.service import ai_service
from app.ai.coordinator import coordinator
from app.ai.schemas import DecisionRequest
import json


class AgentAction(str, Enum):
    """Possible actions the agent can take"""
    ANALYZE_IMAGE = "analyze_image"
    ANALYZE_TEXT = "analyze_text"
    DECISION_ENGINE = "decision_engine"
    SEARCH_PRODUCT = "search_product"
    COMPARE_ALTERNATIVES = "compare_alternatives"
    GENERATE_RECOMMENDATIONS = "generate_recommendations"
    COMPLETE = "complete"


class AgentStep(dict):
    """Represents a single step in the agent's workflow"""
    def __init__(self, action: AgentAction, description: str, result: Any = None, reasoning: str = ""):
        super().__init__()
        self['action'] = action.value
        self['description'] = description
        self['result'] = result
        self['reasoning'] = reasoning


class AutonomousAgent:
    """
    Autonomous AI Agent that orchestrates multi-step food analysis workflow.
    
    Workflow:
    1. Analyze image/text to extract summary and key takeaways
    2. Autonomously decide next steps based on initial analysis
    3. Execute follow-up actions (decision engine, product search, comparisons, etc.)
    4. Synthesize all information into comprehensive response
    """
    
    def __init__(self):
        if not key_manager:
            print("WARNING: No API keys configured. Autonomous agent will fail.")
            self.use_key_manager = False
            self.model = None
            return
        
        self.use_key_manager = True
        self.max_steps = 5  # Prevent infinite loops
        self.progress_callback = None  # Callback for progress updates
        
        # Initialize the Gemini model
        try:
            self.model = key_manager.create_model('gemini-2.5-flash')
            print("✅ Autonomous agent model initialized successfully")
        except Exception as e:
            print(f"❌ Failed to initialize autonomous agent model: {e}")
            self.model = None
    
    def set_progress_callback(self, callback):
        """Set callback function for progress updates"""
        self.progress_callback = callback
    
    async def _report_progress(self, step: int, total: int, message: str, status: str = "in_progress"):
        """Report progress to callback if set"""
        if self.progress_callback:
            await self.progress_callback({
                "step": step,
                "total": total,
                "message": message,
                "status": status
            })
    
    async def _decide_next_action(
        self, 
        initial_analysis: Dict[str, Any], 
        completed_steps: List[AgentStep],
        user_query: Optional[str] = None
    ) -> AgentAction:
        """
        Use AI to decide what action to take next based on:
        - Initial analysis results
        - Steps already completed
        - User's original query (if any)
        """
        if not self.model:
            return AgentAction.COMPLETE
        
        # Build context for decision making
        context = f"""
You are an autonomous food analysis agent. Based on the information below, decide the NEXT BEST ACTION to help the user.

INITIAL ANALYSIS:
{json.dumps(initial_analysis, indent=2)}

COMPLETED STEPS:
{json.dumps([step for step in completed_steps], indent=2)}

USER QUERY: {user_query or "General food analysis"}

AVAILABLE ACTIONS:
1. decision_engine - Deep analysis with decision engine (intent classification, ingredient interpretation, etc.)
2. search_product - Search for this product in global food database
3. compare_alternatives - Find and compare healthier alternatives
4. generate_recommendations - Generate personalized recommendations
5. complete - Analysis is comprehensive, no more actions needed

RULES:
- Always run decision_engine after initial analysis (if not done yet)
- Only search_product if we have a clear product name
- Only compare_alternatives if the product has concerning ingredients
- Only generate_recommendations if user might benefit from guidance
- Choose 'complete' when sufficient information has been gathered

Return ONLY the action name (e.g., "decision_engine", "complete")
"""
        
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.model.generate_content(context)
            )
            
            action_text = response.text.strip().lower()
            
            # Map response to action
            action_map = {
                "decision_engine": AgentAction.DECISION_ENGINE,
                "search_product": AgentAction.SEARCH_PRODUCT,
                "compare_alternatives": AgentAction.COMPARE_ALTERNATIVES,
                "generate_recommendations": AgentAction.GENERATE_RECOMMENDATIONS,
                "complete": AgentAction.COMPLETE
            }
            
            for key, action in action_map.items():
                if key in action_text:
                    return action
            
            # Default to complete if unclear
            return AgentAction.COMPLETE
            
        except Exception as e:
            print(f"Error deciding next action: {e}")
            return AgentAction.COMPLETE
    
    async def _execute_action(
        self, 
        action: AgentAction, 
        context: Dict[str, Any]
    ) -> AgentStep:
        """Execute a specific action and return the result"""
        
        if action == AgentAction.DECISION_ENGINE:
            # Run decision engine analysis
            try:
                extracted_text = context.get('extracted_text', context.get('text', ''))
                request = DecisionRequest(text=extracted_text)
                result = await coordinator.process(request)
                
                return AgentStep(
                    action=action,
                    description="Deep analysis with multi-agent decision engine",
                    result={
                        "quick_insight": result.quick_insight.dict(),
                        "explanation": result.explanation.dict(),
                        "key_signals": result.key_signals,
                        "ingredient_translations": [t.dict() for t in result.ingredient_translations],
                        "uncertainty_flags": result.uncertainty_flags
                    },
                    reasoning="Decision engine provides structured analysis with intent classification and ingredient interpretation"
                )
            except Exception as e:
                return AgentStep(
                    action=action,
                    description="Decision engine analysis failed",
                    result={"error": str(e)},
                    reasoning=f"Error: {str(e)}"
                )
        
        elif action == AgentAction.SEARCH_PRODUCT:
            # Search for product in database
            return AgentStep(
                action=action,
                description="Search global food database",
                result={"status": "not_implemented", "message": "Product search integration pending"},
                reasoning="Would search Open Food Facts database for similar products"
            )
        
        elif action == AgentAction.COMPARE_ALTERNATIVES:
            # Find healthier alternatives
            return AgentStep(
                action=action,
                description="Find healthier alternatives",
                result={"status": "not_implemented", "message": "Alternative comparison pending"},
                reasoning="Would compare with healthier alternatives based on key signals"
            )
        
        elif action == AgentAction.GENERATE_RECOMMENDATIONS:
            # Generate personalized recommendations
            try:
                initial_analysis = context.get('initial_analysis', {})
                
                prompt = f"""
Based on this food analysis, generate 3-5 actionable recommendations for the user.

ANALYSIS:
{json.dumps(initial_analysis, indent=2)}

Provide practical, specific recommendations. Format as JSON:
{{
    "recommendations": [
        {{"title": "...", "description": "...", "priority": "high|medium|low"}},
        ...
    ]
}}
"""
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    lambda: self.model.generate_content(
                        prompt,
                        generation_config=genai.types.GenerationConfig(
                            response_mime_type="application/json"
                        )
                    )
                )
                
                recommendations = json.loads(response.text.strip())
                
                return AgentStep(
                    action=action,
                    description="Generate personalized recommendations",
                    result=recommendations,
                    reasoning="AI-generated recommendations based on analysis"
                )
            except Exception as e:
                return AgentStep(
                    action=action,
                    description="Recommendation generation failed",
                    result={"error": str(e)},
                    reasoning=f"Error: {str(e)}"
                )
        
        else:
            return AgentStep(
                action=action,
                description="Unknown action",
                result=None,
                reasoning="Action not recognized"
            )
    
    async def _synthesize_final_response(
        self, 
        initial_analysis: Dict[str, Any],
        all_steps: List[AgentStep]
    ) -> Dict[str, Any]:
        """
        Synthesize all gathered information into a comprehensive final response
        """
        try:
            synthesis_prompt = f"""
You are synthesizing a comprehensive food analysis report from multiple analysis steps.

INITIAL ANALYSIS:
{json.dumps(initial_analysis, indent=2)}

ALL ANALYSIS STEPS:
{json.dumps([step for step in all_steps], indent=2)}

Create a comprehensive summary that:
1. Highlights the most important findings
2. Provides clear, actionable insights
3. Maintains honest uncertainty where appropriate
4. Gives context-aware recommendations

Format as JSON:
{{
    "executive_summary": "One powerful paragraph summarizing everything",
    "key_takeaways": ["takeaway 1", "takeaway 2", "takeaway 3"],
    "confidence_level": "high|medium|low",
    "next_steps": ["suggestion 1", "suggestion 2"]
}}
"""
            
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.model.generate_content(
                    synthesis_prompt,
                    generation_config=genai.types.GenerationConfig(
                        response_mime_type="application/json"
                    )
                )
            )
            
            synthesis = json.loads(response.text.strip())
            return synthesis
            
        except Exception as e:
            print(f"Error synthesizing response: {e}")
            return {
                "executive_summary": "Analysis completed with multiple steps",
                "key_takeaways": ["See detailed steps for information"],
                "confidence_level": "medium",
                "next_steps": []
            }
    
    async def analyze_autonomously(
        self,
        image_data: Optional[bytes] = None,
        text_data: Optional[str] = None,
        user_query: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Main autonomous analysis workflow.
        
        Args:
            image_data: Image bytes (if analyzing image)
            text_data: Text input (if analyzing text)
            user_query: Optional user query for context
        
        Returns:
            Comprehensive analysis with all steps taken
        """
        if not self.model:
            raise ValueError("Autonomous agent not configured (Missing API Key)")
        
        workflow_steps = []
        estimated_total = 3  # Initial estimate
        
        # STEP 1: Initial Analysis (Image or Text)
        await self._report_progress(1, estimated_total, "Starting initial analysis...")
        print("🤖 Agent Step 1: Initial Analysis")
        if image_data:
            # Analyze image first
            await self._report_progress(1, estimated_total, "Analyzing image...")
            initial_result = await ai_service.analyze_image(image_data, "image/jpeg")
            
            # Also extract text from image for follow-up steps
            await self._report_progress(1, estimated_total, "Extracting text from image...")
            import PIL.Image
            import io
            image = PIL.Image.open(io.BytesIO(image_data))
            
            extraction_prompt = """Extract all text from this food label image.
Return the complete ingredient list and nutrition information."""
            
            loop = asyncio.get_event_loop()
            extraction_response = await loop.run_in_executor(
                None,
                lambda: self.model.generate_content([extraction_prompt, image])
            )
            extracted_text = extraction_response.text.strip()
            
            # Create key takeaways from trade-offs
            key_takeaways = []
            if initial_result.trade_offs.pros:
                key_takeaways.extend([f"✓ {pro}" for pro in initial_result.trade_offs.pros[:2]])
            if initial_result.trade_offs.cons:
                key_takeaways.extend([f"⚠ {con}" for con in initial_result.trade_offs.cons[:2]])
            
            initial_analysis = {
                "insight": initial_result.insight,
                "detailed_reasoning": initial_result.detailed_reasoning,
                "trade_offs": initial_result.trade_offs.dict(),
                "key_takeaways": key_takeaways,  # New field for quick scanning
                "uncertainty_note": initial_result.uncertainty_note,
                "extracted_text": extracted_text
            }
            
            workflow_steps.append(AgentStep(
                action=AgentAction.ANALYZE_IMAGE,
                description="Initial image analysis with text extraction",
                result=initial_analysis,
                reasoning="Extracted summary, key takeaways, and full text for follow-up analysis"
            ))
            
        else:
            # Analyze text
            await self._report_progress(1, estimated_total, "Analyzing text...")
            initial_result = await ai_service.analyze_text(text_data)
            
            # Create key takeaways from trade-offs
            key_takeaways = []
            if initial_result.trade_offs.pros:
                key_takeaways.extend([f"✓ {pro}" for pro in initial_result.trade_offs.pros[:2]])
            if initial_result.trade_offs.cons:
                key_takeaways.extend([f"⚠ {con}" for con in initial_result.trade_offs.cons[:2]])
            
            initial_analysis = {
                "insight": initial_result.insight,
                "detailed_reasoning": initial_result.detailed_reasoning,
                "trade_offs": initial_result.trade_offs.dict(),
                "key_takeaways": key_takeaways,  # New field for quick scanning
                "uncertainty_note": initial_result.uncertainty_note,
                "text": text_data
            }
            
            workflow_steps.append(AgentStep(
                action=AgentAction.ANALYZE_TEXT,
                description="Initial text analysis",
                result=initial_analysis,
                reasoning="Extracted summary and key takeaways"
            ))
        
        # STEP 2-N: Autonomous follow-up actions
        context = {
            "initial_analysis": initial_analysis,
            "extracted_text": initial_analysis.get("extracted_text", initial_analysis.get("text", "")),
            "user_query": user_query
        }
        
        step_count = 1
        while step_count < self.max_steps:
            await self._report_progress(step_count + 1, estimated_total, f"Deciding next action (step {step_count + 1})...")
            print(f"🤖 Agent Step {step_count + 1}: Deciding next action...")
            
            # Decide next action
            next_action = await self._decide_next_action(
                initial_analysis, 
                workflow_steps,
                user_query
            )
            
            print(f"   → Action: {next_action.value}")
            
            if next_action == AgentAction.COMPLETE:
                print("   → Agent decided analysis is complete")
                break
            
            # Execute action
            await self._report_progress(step_count + 1, estimated_total, f"Executing: {next_action.value}...")
            step_result = await self._execute_action(next_action, context)
            workflow_steps.append(step_result)
            
            step_count += 1
        
        # FINAL STEP: Synthesize everything
        await self._report_progress(step_count + 1, step_count + 1, "Synthesizing final response...")
        print("🤖 Final Step: Synthesizing comprehensive response")
        synthesis = await self._synthesize_final_response(initial_analysis, workflow_steps)
        
        await self._report_progress(step_count + 1, step_count + 1, "Analysis complete!", "completed")
        
        return {
            "initial_analysis": initial_analysis,
            "workflow_steps": [dict(step) for step in workflow_steps],
            "synthesis": synthesis,
            "total_steps": len(workflow_steps)
        }


# Singleton instance
autonomous_agent = AutonomousAgent()
