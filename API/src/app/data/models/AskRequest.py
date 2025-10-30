from typing import Dict
from pydantic import BaseModel
"""Class to map the AskRequest model"""

class AskRequest(BaseModel):
    userinput: str
    learningType: str
    level: str
    name: str
    topics_progress: Dict[str, int]